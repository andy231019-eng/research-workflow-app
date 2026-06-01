import {
  formatAnthropicError,
  isWebSearchToolError,
  resolveAnthropicApiKey,
  streamAnthropicText,
} from "@/lib/anthropic";
import { buildReportPrompt } from "@/lib/prompts/industryResearchPrompts";
import { tryParseJson } from "@/lib/utils";
import type { UserResearchInput, ResearchFramework, GeneratedReport, SourceItem } from "@/types/research";

interface RequestBody {
  input: UserResearchInput;
  framework: ResearchFramework;
  apiKey?: string;
}

const NEWLINE = "\n";
const URL_PATTERN = /^https?:\/\/\S+\.\S+/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NUMERIC_CLAIM_PATTERN =
  /(\d[\d,]*(?:\.\d+)?\s?(?:%|％|億|兆|萬|千|百|元|美元|日圓|韓元|台幣|新台幣|k|K|m|M|bn|billion|million|兆元|億元)|EPS|CAGR|capex|CapEx|產能|市佔|毛利率|營益率|淨利|營收|供需|月產|wafers?)/i;

function makeSSELine(type: string, data: Record<string, unknown>): string {
  return "data: " + JSON.stringify({ type, ...data }) + NEWLINE + NEWLINE;
}

function progressStatus(
  message: string,
  progress: number,
  phase: string
): Record<string, unknown> {
  return { message, progress, phase };
}

type ParsedReport = {
  title?: string;
  markdown?: string;
  sources?: SourceItem[];
  dataGaps?: string[];
};

function validateStrictReport(parsed: ParsedReport | null): string[] {
  const errors: string[] = [];

  if (!parsed) return ["Response did not contain valid JSON"];
  if (!parsed.markdown?.trim()) errors.push("Missing markdown report");
  if (!Array.isArray(parsed.sources) || parsed.sources.length === 0) {
    errors.push("sources array is empty");
  }
  if (!Array.isArray(parsed.dataGaps)) errors.push("dataGaps must be an array");

  for (const [index, source] of (parsed.sources ?? []).entries()) {
    const prefix = `sources[${index}]`;
    if (!source.claim?.trim()) errors.push(`${prefix} missing claim`);
    if (!source.sourceTitle?.trim()) errors.push(`${prefix} missing sourceTitle`);
    if (!source.sourceUrl?.trim()) errors.push(`${prefix} missing sourceUrl`);
    if (!source.sourceType?.trim()) errors.push(`${prefix} missing sourceType`);
    if (!source.date?.trim()) errors.push(`${prefix} missing date`);
    if (source.sourceUrl && !URL_PATTERN.test(source.sourceUrl)) {
      errors.push(`${prefix} sourceUrl must be an http(s) URL`);
    }
    if (source.date && !DATE_PATTERN.test(source.date)) {
      errors.push(`${prefix} date must be yyyy-mm-dd`);
    }
    if (NUMERIC_CLAIM_PATTERN.test(source.claim)) {
      if (!source.date?.trim()) errors.push(`${prefix} numeric claim missing date`);
      if (!source.sourceUrl?.trim()) errors.push(`${prefix} numeric claim missing sourceUrl`);
    }
  }

  return errors;
}

function findHighRiskSources(sources: SourceItem[]): SourceItem[] {
  return sources
    .filter((source) => NUMERIC_CLAIM_PATTERN.test(source.claim) || !URL_PATTERN.test(source.sourceUrl))
    .slice(0, 12);
}

function makeAuditPrompt(report: ParsedReport, highRiskSources: SourceItem[]): string {
  return `You are a strict investment committee fact-check reviewer.

TASK: Audit ONLY high-risk numeric claims and source links in the report. Do not rewrite the analysis style. Fix source bullets, remove unsupported numbers, and add data gaps for unresolved conflicts.

HIGH-RISK CLAIMS TO CHECK:
${highRiskSources
  .map(
    (source, index) => `${index + 1}. Claim: ${source.claim}
Source: ${source.sourceTitle} (${source.sourceUrl})
Type=${source.sourceType}; Date=${source.date}`
  )
  .join("\n\n")}

AUDIT RULES:
- Every source must include only claim, sourceTitle, sourceUrl, sourceType, and date.
- sourceUrl must be a real http(s) link, not a fabricated slug.
- date must be yyyy-mm-dd.
- Every markdown section must include "### Sources / 資料來源" with bullets formatted exactly as: - [Title](URL) — Type — yyyy-mm-dd
- If sources conflict, use conservative ranges in markdown or move the claim to Data Gaps.
- Keep unsupported claims out of Final Industry Conclusion.
- Preserve valid sections, but change wording where it is too certain.

Return ONLY valid JSON wrapped in <json>...</json> tags using the same schema:
{
  "title": "string",
  "markdown": "audited markdown",
  "sources": [{"claim":"string","sourceTitle":"string","sourceUrl":"https://...","sourceType":"string","date":"yyyy-mm-dd"}],
  "dataGaps": ["string"]
}

REPORT TO AUDIT:
${JSON.stringify(report)}`;
}

function makeRetryInstruction(errors: string[]): string {
  return `

STRICT VALIDATION FAILED:
${errors.map((e) => `- ${e}`).join("\n")}

Rewrite the report and return ONLY valid JSON. Do not include unsupported sources.
Move every unsupported or insufficiently sourced claim to dataGaps.
Every source must include only claim, sourceTitle, sourceUrl, sourceType, and date.
Every sourceUrl must start with http:// or https://.
Every date must be yyyy-mm-dd.
Every report section must include "### Sources / 資料來源" bullets using: - [Title](URL) — Type — yyyy-mm-dd.`;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  const { input, framework, apiKey } = body;

  if (!framework?.pages?.length) {
    return new Response(JSON.stringify({ error: "framework with pages is required" }), { status: 400 });
  }

  let resolvedApiKey: string;
  try {
    resolvedApiKey = resolveAnthropicApiKey(apiKey);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Anthropic client error" }),
      { status: 500 }
    );
  }

  const prompt = buildReportPrompt(framework, input);
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(makeSSELine(type, data)));
      };
      const generateText = async (
        content: string,
        onChunk?: (text: string) => void
      ): Promise<{ text: string; usingSearch: boolean }> => {
        try {
          const text = await streamAnthropicText(resolvedApiKey, {
            model: "claude-sonnet-4-6",
            max_tokens: 32000,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [{ role: "user", content }],
          }, onChunk);
          return { text, usingSearch: true };
        } catch (err) {
          if (!isWebSearchToolError(err)) throw err;

          send("status", {
            message: "Claude Web Search API 未啟用或不可用，改用純模型模式產出可追溯來源的報告...",
            progress: 18,
            phase: "fallback",
          });
          const text = await streamAnthropicText(resolvedApiKey, {
            model: "claude-sonnet-4-6",
            max_tokens: 32000,
            messages: [{ role: "user", content }],
          }, onChunk);
          return { text, usingSearch: false };
        }
      };
      const auditHighRiskClaims = async (
        report: ParsedReport,
        usingSearch: boolean
      ): Promise<ParsedReport> => {
        const highRiskSources = findHighRiskSources(report.sources ?? []);
        if (highRiskSources.length === 0) return report;

        send("status", {
          ...progressStatus(
            `正在針對 ${highRiskSources.length} 個高風險數字與來源連結做二次審核...`,
            82,
            "audit"
          ),
        });

        try {
          const auditPrompt = makeAuditPrompt(report, highRiskSources);
          const text = usingSearch
            ? await streamAnthropicText(resolvedApiKey, {
                model: "claude-sonnet-4-6",
                max_tokens: 12000,
                tools: [{ type: "web_search_20250305", name: "web_search" }],
                messages: [{ role: "user", content: auditPrompt }],
              })
            : await streamAnthropicText(resolvedApiKey, {
                model: "claude-sonnet-4-6",
                max_tokens: 12000,
                messages: [{ role: "user", content: auditPrompt }],
              });

          const audited = tryParseJson<ParsedReport>(text);
          const auditErrors = validateStrictReport(audited);
          if (auditErrors.length > 0) {
            send("status", {
              ...progressStatus(
                "高風險數字審核未完全通過；保留原始報告並新增資料缺口提醒。",
                92,
                "audit_warning"
              ),
            });
            return {
              ...report,
              dataGaps: [
                ...(report.dataGaps ?? []),
                "高風險數字二次審核未完全通過，引用前請人工確認： " + auditErrors.slice(0, 5).join("; "),
              ],
            };
          }
          return audited as ParsedReport;
        } catch (err) {
          send("status", {
            ...progressStatus(
              "高風險數字審核失敗；保留原始報告並新增資料缺口提醒。",
              92,
              "audit_warning"
            ),
          });
          return {
            ...report,
            dataGaps: [
              ...(report.dataGaps ?? []),
              "高風險數字二次審核執行失敗，引用前請人工確認：" + formatAnthropicError(err),
            ],
          };
        }
      };

      try {
        let lastErrors: string[] = [];
        let usingSearch = true;

        for (let attempt = 1; attempt <= 2; attempt++) {
          send("status", {
            ...progressStatus(
              attempt === 1
                ? "Claude 正在搜尋最新資料並撰寫研究報告，完成後會檢查來源連結格式..."
                : "第一次來源格式檢查未通過，Claude 正在補強來源並重寫不足內容...",
              attempt === 1 ? 12 : 62,
              attempt === 1 ? "research_write" : "rewrite"
            ),
          });

          const content =
            attempt === 1 ? prompt : prompt + makeRetryInstruction(lastErrors);

          const result = await generateText(
            content,
            attempt === 1 ? (text) => send("chunk", { text }) : undefined
          );
          usingSearch = result.usingSearch;

          const parsed = tryParseJson<ParsedReport>(result.text);
          send("status", {
            ...progressStatus("正在檢查來源分級、數字與證據狀態...", attempt === 1 ? 68 : 76, "validation"),
          });
          const validationErrors = validateStrictReport(parsed);

          if (validationErrors.length > 0) {
            lastErrors = validationErrors;
            if (attempt === 2) {
              throw new Error(
                "Strict evidence validation failed: " + validationErrors.join("; ")
              );
            }
            continue;
          }

          const validParsed = await auditHighRiskClaims(parsed as ParsedReport, usingSearch);
          send("status", {
            ...progressStatus("正在整理最終報告與資料缺口...", 96, "finalize"),
          });
          const report: GeneratedReport = {
            id: "report_" + Date.now(),
            title: validParsed.title ?? framework.projectTitle,
            markdown: validParsed.markdown ?? "",
            sources: validParsed.sources ?? [],
            dataGaps: [
              ...(usingSearch
                ? []
                : ["Claude Web Search API 未啟用；本報告只保留模型輸出中可追溯來源的內容，未能驗證者已列為資料缺口。"]),
              ...(validParsed.dataGaps ?? []),
            ],
            createdAt: new Date().toISOString(),
            geography: framework.geography,
            analysisPurpose: framework.analysisPurpose,
            timeHorizon: framework.timeHorizon,
            webSearchUsed: usingSearch,
          };
          send("done", { report, progress: 100, phase: "done" });
          controller.close();
          return;
        }
      } catch (err) {
        const msg = formatAnthropicError(err);
        send("error", { message: "Report generation failed: " + msg });
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
