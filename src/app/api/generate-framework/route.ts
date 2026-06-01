import { NextResponse } from "next/server";
import {
  createAnthropicMessage,
  formatAnthropicError,
  getApiKeyDiagnostics,
  getFirstTextBlock,
  resolveAnthropicApiKey,
} from "@/lib/anthropic";
import { buildFrameworkOutlinePrompt } from "@/lib/prompts/industryResearchPrompts";
import { generateId, tryParseJson } from "@/lib/utils";
import type { UserResearchInput, ResearchFramework } from "@/types/research";

interface RequestBody extends UserResearchInput {
  apiKey?: string;
}

type FrameworkOutlineResponse = Partial<Omit<ResearchFramework, "pages">> & {
  pages?: Array<Partial<ResearchFramework["pages"][number]>>;
};

function emptyIndustryDefinition(): ResearchFramework["industryDefinition"] {
  return {
    included: [],
    excluded: [],
    valueChain: {
      upstream: [],
      midstream: [],
      downstream: [],
    },
    coreNatureOneLiner: "",
    framingNotes: [],
  };
}

function emptyPlayers(): ResearchFramework["possiblePlayers"] {
  return {
    leaders: [],
    challengers: [],
    disruptors: [],
    commodityPlayers: [],
  };
}

function normalizeFramework(
  framework: FrameworkOutlineResponse,
  input: UserResearchInput
): ResearchFramework {
  return {
    projectTitle: framework.projectTitle || `${input.industryName}研究架構`,
    industryName: framework.industryName || input.industryName,
    geography: framework.geography || input.geographies.join("、") || "全球",
    analysisPurpose: framework.analysisPurpose || input.analysisPurpose,
    timeHorizon: framework.timeHorizon || input.timeHorizon,
    industryDefinition: framework.industryDefinition ?? emptyIndustryDefinition(),
    possiblePlayers: framework.possiblePlayers ?? emptyPlayers(),
    dataGapsToResolve: framework.dataGapsToResolve ?? [],
    pages: (framework.pages ?? []).map((p, i) => ({
      id: p.id || generateId(),
      pageTitle: p.pageTitle || `研究頁面 ${i + 1}`,
      pageNumber: p.pageNumber ?? i + 1,
      coreQuestion: p.coreQuestion || "",
      mainMessageHypothesis: p.mainMessageHypothesis || "",
      requiredData: p.requiredData ?? [],
      evidenceNeeded: p.evidenceNeeded ?? [],
      suggestedSources: p.suggestedSources ?? [],
      suggestedVisual: p.suggestedVisual ?? "",
      analysisAngle: p.analysisAngle ?? "",
      mustAnswer: p.mustAnswer ?? [],
      detailStatus: p.detailStatus ?? "outline",
    })),
  };
}

function validateFramework(fw: ResearchFramework): string | null {
  if (!fw.industryName) return "Missing industryName";
  if (!fw.pages || fw.pages.length === 0) return "pages array is empty";
  for (const p of fw.pages) {
    if (!p.pageTitle) return `Page ${p.pageNumber} missing pageTitle`;
    if (!p.coreQuestion) return `Page ${p.pageNumber} missing coreQuestion`;
  }
  return null;
}

function durationMs(startedAt: number): number {
  return Date.now() - startedAt;
}

function errorDetails(err: unknown): Record<string, unknown> {
  return {
    name: err instanceof Error ? err.name : typeof err,
    message: err instanceof Error ? err.message : String(err),
    status: (err as { status?: number }).status,
    responsePreview: (err as { responseText?: string }).responseText?.slice(0, 300),
  };
}

function jsonError(error: string, status: number, requestId: string) {
  const message = error.trim() || "Framework generation failed before a detailed error was captured.";
  return NextResponse.json({ error: message, requestId }, { status });
}

export async function POST(req: Request) {
  const requestId = generateId();
  const startedAt = Date.now();
  let body: RequestBody;

  try {
    body = (await req.json()) as RequestBody;
  } catch (err) {
    console.warn(`[generate-framework:${requestId}] invalid request body`, {
      durationMs: durationMs(startedAt),
      error: errorDetails(err),
    });
    return jsonError("Invalid request body", 400, requestId);
  }

  const { apiKey, ...input } = body;
  const industryName = input.industryName?.trim() || "(missing)";

  console.info(`[generate-framework:${requestId}] started`, {
    industryName,
    startedAt: new Date(startedAt).toISOString(),
    apiKey: getApiKeyDiagnostics(apiKey),
  });

  if (!input.industryName?.trim()) {
    console.warn(`[generate-framework:${requestId}] missing industryName`, {
      durationMs: durationMs(startedAt),
    });
    return jsonError("industryName is required", 400, requestId);
  }

  let resolvedApiKey: string;
  try {
    resolvedApiKey = resolveAnthropicApiKey(apiKey);
  } catch (err) {
    console.error(`[generate-framework:${requestId}] client error`, {
      durationMs: durationMs(startedAt),
      error: errorDetails(err),
    });
    return jsonError(
      err instanceof Error ? err.message : "Anthropic client error",
      500,
      requestId
    );
  }

  const prompt = buildFrameworkOutlinePrompt(input as UserResearchInput);

  try {
    const attemptStartedAt = Date.now();

    console.info(`[generate-framework:${requestId}] Claude outline call started`);

    const message = await createAnthropicMessage(resolvedApiKey, {
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    console.info(`[generate-framework:${requestId}] Claude outline call completed`, {
      durationMs: durationMs(attemptStartedAt),
      usage: (message as { usage?: unknown }).usage,
      stopReason: (message as { stop_reason?: unknown }).stop_reason,
    });

    const raw = getFirstTextBlock(message);
    const parsed = tryParseJson<FrameworkOutlineResponse>(raw);

    if (!parsed) {
      console.warn(`[generate-framework:${requestId}] JSON parse failed`, {
        responseLength: raw.length,
        durationMs: durationMs(startedAt),
      });
      return jsonError("Claude 回傳內容不是可解析的研究架構 JSON", 500, requestId);
    }

    const withIds = normalizeFramework(parsed, input as UserResearchInput);
    const validationError = validateFramework(withIds);

    if (validationError) {
      console.warn(`[generate-framework:${requestId}] validation failed`, {
        validationError,
        durationMs: durationMs(startedAt),
      });
      return jsonError("Claude 回傳的研究架構未通過驗證：" + validationError, 500, requestId);
    }

    console.info(`[generate-framework:${requestId}] succeeded`, {
      pages: withIds.pages.length,
      detailedPages: withIds.pages.filter((p) => p.detailStatus === "detailed").length,
      durationMs: durationMs(startedAt),
    });
    return NextResponse.json(withIds);
  } catch (err) {
    const lastError = formatAnthropicError(err);
    console.error(`[generate-framework:${requestId}] failed`, {
      durationMs: durationMs(startedAt),
      error: lastError,
      details: errorDetails(err),
    });
    return jsonError(
      "Framework outline generation failed: " + (lastError || "No detailed error was captured."),
      500,
      requestId
    );
  }
}
