import { NextResponse } from "next/server";
import {
  createAnthropicMessage,
  formatAnthropicError,
  getFirstTextBlock,
  resolveAnthropicApiKey,
} from "@/lib/anthropic";
import { buildFrameworkDetailPrompt } from "@/lib/prompts/industryResearchPrompts";
import { tryParseJson } from "@/lib/utils";
import type { FrameworkPage, ResearchFramework, UserResearchInput } from "@/types/research";

interface RequestBody {
  input: UserResearchInput;
  framework: ResearchFramework;
  pageIds?: string[];
  apiKey?: string;
}

interface DetailResponse {
  pages?: Array<Partial<FrameworkPage>>;
}

function normalizePageDetail(existing: FrameworkPage, detail: Partial<FrameworkPage>): FrameworkPage {
  return {
    ...existing,
    ...detail,
    id: existing.id,
    pageNumber: existing.pageNumber,
    pageTitle: detail.pageTitle || existing.pageTitle,
    coreQuestion: detail.coreQuestion || existing.coreQuestion,
    mainMessageHypothesis: detail.mainMessageHypothesis || existing.mainMessageHypothesis,
    requiredData: detail.requiredData ?? existing.requiredData ?? [],
    evidenceNeeded: detail.evidenceNeeded ?? existing.evidenceNeeded ?? [],
    suggestedSources: detail.suggestedSources ?? existing.suggestedSources ?? [],
    suggestedVisual: detail.suggestedVisual ?? existing.suggestedVisual ?? "",
    analysisAngle: detail.analysisAngle ?? existing.analysisAngle ?? "",
    mustAnswer: detail.mustAnswer ?? existing.mustAnswer ?? [],
    detailStatus: "detailed",
  };
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  let body: RequestBody;

  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const { input, framework, pageIds, apiKey } = body;

  if (!input?.industryName?.trim()) {
    return jsonError("input.industryName is required", 400);
  }
  if (!framework?.pages?.length) {
    return jsonError("framework.pages is required", 400);
  }

  let resolvedApiKey: string;
  try {
    resolvedApiKey = resolveAnthropicApiKey(apiKey);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Anthropic client error", 401);
  }

  const selectedPages = (pageIds?.length
    ? framework.pages.filter((page) => pageIds.includes(page.id))
    : framework.pages.filter((page) => page.detailStatus !== "detailed").slice(0, 3)
  ).slice(0, 3);

  if (selectedPages.length === 0) {
    return NextResponse.json({ pages: [] });
  }

  const prompt = buildFrameworkDetailPrompt(framework, input, selectedPages);
  const startedAt = Date.now();

  try {
    const message = await createAnthropicMessage(resolvedApiKey, {
      model: "claude-sonnet-4-6",
      max_tokens: 4500,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    console.info("[enrich-framework-details] Claude call completed", {
      durationMs: Date.now() - startedAt,
      pageIds: selectedPages.map((p) => p.id),
      usage: (message as { usage?: unknown }).usage,
      stopReason: (message as { stop_reason?: unknown }).stop_reason,
    });

    const parsed = tryParseJson<DetailResponse>(getFirstTextBlock(message));
    if (!parsed?.pages?.length) {
      return jsonError("Claude 回傳內容不是可解析的頁面細節 JSON", 500);
    }

    const byId = new Map(parsed.pages.map((page) => [page.id, page]));
    const pages = selectedPages.map((existing) => {
      const detail = byId.get(existing.id);
      if (!detail) return { ...existing, detailStatus: "detailed" as const };
      return normalizePageDetail(existing, detail);
    });

    return NextResponse.json({ pages });
  } catch (err) {
    return jsonError("Framework detail enrichment failed: " + formatAnthropicError(err), 500);
  }
}
