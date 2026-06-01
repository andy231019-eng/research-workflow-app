import {
  formatAnthropicError,
  isWebSearchToolError,
  resolveAnthropicApiKey,
  streamAnthropicText,
} from "@/lib/anthropic";
import { buildReportPrompt } from "@/lib/prompts/industryResearchPrompts";
import { generateId, tryParseJson } from "@/lib/utils";
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
const REPORT_SERVER_TIMEOUT_MS = 8 * 60 * 1000;

function getReportMaxTokens(pageCount: number): number {
  if (pageCount <= 3) return 8000;
  if (pageCount <= 6) return 12000;
  if (pageCount <= 9) return 16000;
  return 20000;
}

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

function usableSources(sources: SourceItem[] = []): SourceItem[] {
  return sources.filter((source) => {
    if (!source.claim?.trim()) return false;
    if (!source.sourceTitle?.trim()) return false;
    if (!source.sourceUrl?.trim() || !URL_PATTERN.test(source.sourceUrl)) return false;
    if (!source.sourceType?.trim()) return false;
    if (!source.date?.trim() || !DATE_PATTERN.test(source.date)) return false;
    return true;
  });
}

function makeReport(
  parsed: ParsedReport,
  framework: ResearchFramework,
  usingSearch: boolean,
  extraDataGaps: string[] = []
): GeneratedReport {
  return {
    id: "report_" + Date.now(),
    title: parsed.title ?? framework.projectTitle,
    markdown: parsed.markdown ?? "",
    sources: usableSources(parsed.sources ?? []),
    dataGaps: [
      ...(usingSearch
        ? []
        : ["Claude Web Search API 未啟用；本報告只保留模型輸出中可追溯來源的內容，未能驗證者已列為資料缺口。"]),
      ...(parsed.dataGaps ?? []),
      ...extraDataGaps,
    ],
    createdAt: new Date().toISOString(),
    geography: framework.geography,
    analysisPurpose: framework.analysisPurpose,
    timeHorizon: framework.timeHorizon,
    webSearchUsed: usingSearch,
  };
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
  const requestId = generateId();
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body", requestId }), { status: 400 });
  }

  const { input, framework, apiKey } = body;

  if (!framework?.pages?.length) {
    return new Response(JSON.stringify({ error: "framework with pages is required", requestId }), { status: 400 });
  }

  let resolvedApiKey: string;
  try {
    resolvedApiKey = resolveAnthropicApiKey(apiKey);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Anthropic client error", requestId }),
      { status: 500 }
    );
  }

  const prompt = buildReportPrompt(framework, input);
  const maxTokens = getReportMaxTokens(framework.pages.length);
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const abortController = new AbortController();
      let closed = false;
      const deadline = setTimeout(() => {
        abortController.abort();
      }, REPORT_SERVER_TIMEOUT_MS);
      const send = (type: string, data: Record<string, unknown>) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(makeSSELine(type, { requestId, ...data })));
        } catch {
          closed = true;
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        clearTimeout(deadline);
        try {
          controller.close();
        } catch {
          // already closed/cancelled by proxy or client
        }
      };
      const generateText = async (
        content: string,
        onChunk?: (text: string) => void
      ): Promise<{ text: string; usingSearch: boolean }> => {
        try {
          const text = await streamAnthropicText(resolvedApiKey, {
            model: "claude-sonnet-4-6",
            max_tokens: maxTokens,
            tools: [{ type: "web_search_20250305", name: "web_search" }],
            messages: [{ role: "user", content }],
          }, onChunk, abortController.signal);
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
            max_tokens: maxTokens,
            messages: [{ role: "user", content }],
          }, onChunk, abortController.signal);
          return { text, usingSearch: false };
        }
      };
      try {
        let lastErrors: string[] = [];
        let usingSearch = true;
        let latestParsed: ParsedReport | null = null;

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
            (text) => send("chunk", { text })
          );
          usingSearch = result.usingSearch;

          const parsed = tryParseJson<ParsedReport>(result.text);
          if (parsed?.markdown?.trim()) latestParsed = parsed;
          send("status", {
            ...progressStatus("正在檢查來源分級、數字與證據狀態...", attempt === 1 ? 68 : 76, "validation"),
          });
          const validationErrors = validateStrictReport(parsed);

          if (validationErrors.length > 0) {
            lastErrors = validationErrors;
            if (attempt === 2) {
              if (!latestParsed?.markdown?.trim()) {
                throw new Error(
                  "Strict evidence validation failed and no usable markdown draft was available: " +
                    validationErrors.join("; ")
                );
              }
              send("status", {
                ...progressStatus(
                  "來源格式仍未完全通過；保留可讀草稿並將未通過項目列入資料缺口。",
                  90,
                  "validation_warning"
                ),
              });
              const report = makeReport(latestParsed, framework, usingSearch, [
                "來源格式驗證未完全通過，引用前請人工確認：" + validationErrors.slice(0, 8).join("; "),
              ]);
              send("status", {
                ...progressStatus("正在整理最終報告與資料缺口...", 96, "finalize"),
              });
              send("done", { report, progress: 100, phase: "done" });
              close();
              return;
            }
            continue;
          }

          send("status", {
            ...progressStatus("正在整理最終報告與資料缺口...", 96, "finalize"),
          });
          const report = makeReport(parsed as ParsedReport, framework, usingSearch);
          send("done", { report, progress: 100, phase: "done" });
          close();
          return;
        }
      } catch (err) {
        const msg = formatAnthropicError(err);
        send("error", {
          message: "Report generation failed: " + msg,
          phase: abortController.signal.aborted ? "timeout" : "error",
        });
        close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
