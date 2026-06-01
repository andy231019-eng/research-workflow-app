import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
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

export async function POST(req: Request) {
  const requestId = generateId();
  const startedAt = Date.now();
  let body: RequestBody;

  try {
    body = (await req.json()) as RequestBody;
  } catch {
    console.warn(`[generate-framework:${requestId}] invalid request body`);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { apiKey, ...input } = body;
  const industryName = input.industryName?.trim() || "(missing)";

  console.info(`[generate-framework] apiKey received: "${apiKey ? `${apiKey.slice(0, 12)}...${apiKey.slice(-4)} (len=${apiKey.length})` : "(none)"}"`);

  console.info(`[generate-framework:${requestId}] started`, {
    industryName,
    startedAt: new Date(startedAt).toISOString(),
  });

  if (!input.industryName?.trim()) {
    console.warn(`[generate-framework:${requestId}] missing industryName`, {
      durationMs: durationMs(startedAt),
    });
    return NextResponse.json({ error: "industryName is required" }, { status: 400 });
  }

  let client;
  try {
    client = getAnthropicClient(apiKey);
  } catch (err) {
    console.error(`[generate-framework:${requestId}] client error`, {
      durationMs: durationMs(startedAt),
      error: err instanceof Error ? err.message : "Anthropic client error",
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Anthropic client error" },
      { status: 500 }
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

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 12000,
        messages: [{ role: "user", content: prompt + retryNote }],
      });

      console.info(`[generate-framework:${requestId}] Claude call completed`, {
        attempt,
        durationMs: durationMs(attemptStartedAt),
      });

      const raw = (message.content[0] as { type: string; text: string }).text;
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
      lastError = err instanceof Error ? err.message : "Unknown error";
      console.error(`[generate-framework:${requestId}] attempt failed`, {
        attempt,
        durationMs: durationMs(startedAt),
        error: lastError,
      });
      if (attempt === 2) {
        console.error(`[generate-framework:${requestId}] failed`, {
          durationMs: durationMs(startedAt),
          error: lastError,
        });
        return NextResponse.json(
          { error: "Framework generation failed: " + lastError },
          { status: 500 }
        );
      }
    }
  }

  console.error(`[generate-framework:${requestId}] failed`, {
    durationMs: durationMs(startedAt),
    error: lastError,
  });
  return NextResponse.json(
    { error: "Framework generation failed: " + lastError },
    { status: 500 }
  );
}
