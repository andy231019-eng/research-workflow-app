import { NextResponse } from "next/server";
import {
  createAnthropicMessage,
  formatAnthropicError,
  getApiKeyDiagnostics,
  getFirstTextBlock,
  isRetryableGenerationError,
  resolveAnthropicApiKey,
} from "@/lib/anthropic";
import { buildFrameworkPrompt } from "@/lib/prompts/industryResearchPrompts";
import { generateId, tryParseJson } from "@/lib/utils";
import type { UserResearchInput, ResearchFramework } from "@/types/research";

interface RequestBody extends UserResearchInput {
  apiKey?: string;
}

function ensurePageIds(framework: ResearchFramework): ResearchFramework {
  return {
    ...framework,
    pages: (framework.pages ?? []).map((p, i) => ({
      ...p,
      id: p.id || generateId(),
      pageNumber: p.pageNumber ?? i + 1,
      requiredData: p.requiredData ?? [],
      evidenceNeeded: p.evidenceNeeded ?? [],
      suggestedSources: p.suggestedSources ?? [],
      mustAnswer: p.mustAnswer ?? [],
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
  return NextResponse.json({ error, requestId }, { status });
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

  const prompt = buildFrameworkPrompt(input as UserResearchInput);
  let lastError = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const attemptStartedAt = Date.now();
      const retryNote =
        attempt > 1
          ? "\n\nPrevious attempt failed: " + lastError + "\nReturn ONLY valid JSON matching the schema. No markdown fences."
          : "";

      console.info(`[generate-framework:${requestId}] Claude call started`, {
        attempt,
        totalAttempts: 2,
      });

      const message = await createAnthropicMessage(resolvedApiKey, {
        model: "claude-sonnet-4-6",
        max_tokens: 12000,
        messages: [{ role: "user", content: prompt + retryNote }],
      });

      console.info(`[generate-framework:${requestId}] Claude call completed`, {
        attempt,
        durationMs: durationMs(attemptStartedAt),
      });

      const raw = getFirstTextBlock(message);
      const parsed = tryParseJson<ResearchFramework>(raw);

      if (!parsed) {
        lastError = "Claude 回傳內容不是可解析的研究架構 JSON";
        console.warn(`[generate-framework:${requestId}] JSON parse failed`, {
          attempt,
          responseLength: raw.length,
          durationMs: durationMs(startedAt),
        });
        continue;
      }

      const withIds = ensurePageIds(parsed);
      const validationError = validateFramework(withIds);

      if (validationError) {
        lastError = "Claude 回傳的研究架構未通過驗證：" + validationError;
        console.warn(`[generate-framework:${requestId}] validation failed`, {
          attempt,
          validationError,
          durationMs: durationMs(startedAt),
        });
        continue;
      }

      console.info(`[generate-framework:${requestId}] succeeded`, {
        attempt,
        pages: withIds.pages.length,
        durationMs: durationMs(startedAt),
      });
      return NextResponse.json(withIds);
    } catch (err) {
      lastError = formatAnthropicError(err);
      console.error(`[generate-framework:${requestId}] attempt failed`, {
        attempt,
        durationMs: durationMs(startedAt),
        error: lastError,
        details: errorDetails(err),
      });
      if (attempt === 2 || !isRetryableGenerationError(err)) {
        console.error(`[generate-framework:${requestId}] failed`, {
          durationMs: durationMs(startedAt),
          error: lastError,
        });
        return jsonError("Framework generation failed: " + lastError, 500, requestId);
      }
    }
  }

  console.error(`[generate-framework:${requestId}] failed`, {
    durationMs: durationMs(startedAt),
    error: lastError,
  });
  return jsonError("Framework generation failed: " + lastError, 500, requestId);
}
