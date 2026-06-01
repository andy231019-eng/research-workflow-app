import { getAnthropicClient } from "@/lib/anthropic";
import { buildReportPrompt } from "@/lib/prompts/industryResearchPrompts";
import { tryParseJson } from "@/lib/utils";
import type { UserResearchInput, ResearchFramework, GeneratedReport, SourceItem } from "@/types/research";

interface RequestBody {
  input: UserResearchInput;
  framework: ResearchFramework;
  apiKey?: string;
}

const NEWLINE = "\n";

function makeSSELine(type: string, data: Record<string, unknown>): string {
  return "data: " + JSON.stringify({ type, ...data }) + NEWLINE + NEWLINE;
}

type ParsedReport = {
  title?: string;
  markdown?: string;
  sources?: SourceItem[];
  dataGaps?: string[];
};

const SOURCE_TYPES = new Set<SourceItem["sourceType"]>([
  "official",
  "company",
  "industry_report",
  "market_data",
  "media",
  "community",
  "other",
]);

const CLAIM_TYPES = new Set<SourceItem["claimType"]>(["fact", "inference", "judgment"]);
const EVIDENCE_STATUSES = new Set<SourceItem["evidenceStatus"]>([
  "verified",
  "partial",
  "unsupported",
]);

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
    if (!CLAIM_TYPES.has(source.claimType)) errors.push(`${prefix} has invalid claimType`);
    if (!source.sourceTitle?.trim()) errors.push(`${prefix} missing sourceTitle`);
    if (!source.sourceUrl?.trim()) errors.push(`${prefix} missing sourceUrl`);
    if (!SOURCE_TYPES.has(source.sourceType)) errors.push(`${prefix} has invalid sourceType`);
    if (
      typeof source.reliabilityScore !== "number" ||
      source.reliabilityScore < 1 ||
      source.reliabilityScore > 5
    ) {
      errors.push(`${prefix} has invalid reliabilityScore`);
    }
    if (!EVIDENCE_STATUSES.has(source.evidenceStatus)) {
      errors.push(`${prefix} has invalid evidenceStatus`);
    }
    if (source.evidenceStatus === "unsupported") {
      errors.push(`${prefix} is unsupported; unsupported claims must be moved to dataGaps`);
    }
  }

  return errors;
}

function makeRetryInstruction(errors: string[]): string {
  return `

STRICT VALIDATION FAILED:
${errors.map((e) => `- ${e}`).join("\n")}

Rewrite the report and return ONLY valid JSON. Do not include unsupported sources.
Move every unsupported or insufficiently sourced claim to dataGaps.
The report body, especially Fact/Judgment/Final Industry Conclusion, must only use verified or clearly partial evidence listed in sources.`;
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

  let client;
  try {
    client = getAnthropicClient(apiKey);
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
      const collectStreamText = async (
        stream: ReturnType<typeof client.messages.stream>,
        onChunk?: (text: string) => void
      ): Promise<string> => {
        let fullText = "";
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullText += event.delta.text;
            onChunk?.(event.delta.text);
          }
        }
        return fullText;
      };
      const generateText = async (
        content: string,
        onChunk?: (text: string) => void
      ): Promise<{ text: string; usingSearch: boolean }> => {
        try {
          const stream = client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 32000,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tools: [{ type: "web_search_20250305", name: "web_search" } as any],
            messages: [{ role: "user", content }],
          });
          return { text: await collectStreamText(stream, onChunk), usingSearch: true };
        } catch {
          const stream = client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 32000,
            messages: [{ role: "user", content }],
          });
          return { text: await collectStreamText(stream, onChunk), usingSearch: false };
        }
      };

      try {
        let lastErrors: string[] = [];
        let usingSearch = true;

        for (let attempt = 1; attempt <= 2; attempt++) {
          send("status", {
            message:
              attempt === 1
                ? "Claude 正在搜尋最新資料並撰寫研究報告，完成後會先進行可信度檢查..."
                : "第一次可信度檢查未通過，Claude 正在補強來源並重寫未驗證內容...",
          });

          const content =
            attempt === 1 ? prompt : prompt + makeRetryInstruction(lastErrors);

          const result = await generateText(
            content,
            attempt === 1 ? (text) => send("chunk", { text }) : undefined
          );
          usingSearch = result.usingSearch;

          const parsed = tryParseJson<ParsedReport>(result.text);
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

          const validParsed = parsed as ParsedReport;
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
          send("done", { report });
          controller.close();
          return;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        send("error", { message: "Report generation failed: " + msg });
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
