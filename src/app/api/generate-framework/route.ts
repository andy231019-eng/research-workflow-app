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

const FRAMEWORK_SERVER_TIMEOUT_MS = 23_000;

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

function isKeyPlayersOnly(input: UserResearchInput): boolean {
  return input.selectedFocusAreas.length === 1 && input.selectedFocusAreas[0] === "key_players";
}

function getFrameworkMaxTokens(input: UserResearchInput): number {
  return isKeyPlayersOnly(input) ? 2200 : 3000;
}

function buildFallbackFramework(input: UserResearchInput): ResearchFramework {
  const keyPlayersOnly = isKeyPlayersOnly(input);
  const pages: ResearchFramework["pages"] = keyPlayersOnly
    ? [
        {
          id: generateId(),
          pageNumber: 1,
          pageTitle: "主要玩家分層與角色定位",
          coreQuestion: "這個產業中的 leaders、challengers、niche players 與潛在 disruptors 分別是誰？",
          mainMessageHypothesis: "產業競爭力通常集中在少數具備客戶關係、技術能力、產能或通路優勢的玩家。",
          requiredData: [],
          evidenceNeeded: [],
          suggestedSources: [],
          suggestedVisual: "玩家分層矩陣：市場地位 x 技術或商業模式差異",
          analysisAngle: "",
          mustAnswer: [],
          detailStatus: "outline",
        },
        {
          id: generateId(),
          pageNumber: 2,
          pageTitle: "競爭優勢與商業模式差異",
          coreQuestion: "各主要玩家靠什麼取得定價權、毛利差異或客戶黏著度？",
          mainMessageHypothesis: "真正的差異通常不只在規模，而是在產品組合、關鍵客戶、技術門檻與供應鏈掌控能力。",
          requiredData: [],
          evidenceNeeded: [],
          suggestedSources: [],
          suggestedVisual: "競爭優勢對照表：玩家 x moat x 風險",
          analysisAngle: "",
          mustAnswer: [],
          detailStatus: "outline",
        },
        {
          id: generateId(),
          pageNumber: 3,
          pageTitle: "未來贏家與被低估風險",
          coreQuestion: "哪些玩家最可能受益，哪些玩家可能被技術、客戶集中或價格壓力削弱？",
          mainMessageHypothesis: "贏家判斷應同時檢查需求暴露、產能擴張、技術 roadmap、財務韌性與客戶集中度。",
          requiredData: [],
          evidenceNeeded: [],
          suggestedSources: [],
          suggestedVisual: "贏家風險地圖：upside drivers x downside risks",
          analysisAngle: "",
          mustAnswer: [],
          detailStatus: "outline",
        },
      ]
    : [
        {
          id: generateId(),
          pageNumber: 1,
          pageTitle: "產業邊界與研究問題",
          coreQuestion: "這次研究應該如何界定產業範圍，避免把相鄰但不同經濟邏輯的市場混在一起？",
          mainMessageHypothesis: "先收斂產業邊界與價值鏈位置，能降低後續資料搜尋與報告生成的成本。",
          requiredData: [],
          evidenceNeeded: [],
          suggestedSources: [],
          suggestedVisual: "產業邊界與價值鏈定位圖",
          analysisAngle: "",
          mustAnswer: [],
          detailStatus: "outline",
        },
        {
          id: generateId(),
          pageNumber: 2,
          pageTitle: "市場結構與核心驅動因素",
          coreQuestion: "這個產業的需求成長、供給限制、價格權力與週期性如何互相影響？",
          mainMessageHypothesis: "產業吸引力取決於需求成長是否能轉化為可持續的利潤池，而不只是營收擴張。",
          requiredData: [],
          evidenceNeeded: [],
          suggestedSources: [],
          suggestedVisual: "市場結構驅動因素樹",
          analysisAngle: "",
          mustAnswer: [],
          detailStatus: "outline",
        },
        {
          id: generateId(),
          pageNumber: 3,
          pageTitle: "主要玩家與策略意涵",
          coreQuestion: "哪些玩家最能捕捉利潤池，哪些策略或投資判斷需要優先驗證？",
          mainMessageHypothesis: "應把玩家定位、競爭優勢與未來風險連回使用者的決策目的。",
          requiredData: [],
          evidenceNeeded: [],
          suggestedSources: [],
          suggestedVisual: "玩家定位與策略意涵矩陣",
          analysisAngle: "",
          mustAnswer: [],
          detailStatus: "outline",
        },
      ];

  return {
    projectTitle: `${input.industryName}研究架構（fallback 大綱）`,
    industryName: input.industryName,
    geography: input.geographies.join("、") || "全球",
    analysisPurpose: input.analysisPurpose,
    timeHorizon: input.timeHorizon,
    industryDefinition: {
      included: [input.industryName],
      excluded: ["待使用者或後續細節補齊時確認"],
      valueChain: {
        upstream: [],
        midstream: [],
        downstream: [],
      },
      coreNatureOneLiner: "Claude 產生架構逾時，因此先提供可編輯的保守研究大綱；可重試或補齊細節後再產報告。",
      framingNotes: [
        "這是 timeout fallback，不是 Claude 完整產生的研究架構。",
        "建議先確認頁面方向，必要時重試架構生成或直接補齊細節。",
      ],
    },
    possiblePlayers: emptyPlayers(),
    pages,
    dataGapsToResolve: [
      "原始 framework generation timeout，尚未完成模型產生的大綱驗證。",
      "後續報告生成時需要自行推導或補齊 required data、evidence、sources。",
    ],
  };
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

function jsonErrorWithFallback(
  error: string,
  status: number,
  requestId: string,
  fallbackFramework: ResearchFramework
) {
  const message = error.trim() || "Framework generation failed before a detailed error was captured.";
  return NextResponse.json({ error: message, requestId, fallbackFramework }, { status });
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

  const researchInput = input as UserResearchInput;
  const prompt = buildFrameworkOutlinePrompt(researchInput);
  const maxTokens = getFrameworkMaxTokens(researchInput);

  try {
    const attemptStartedAt = Date.now();
    const controller = new AbortController();
    let serverTimeoutFired = false;
    const timeout = setTimeout(() => {
      serverTimeoutFired = true;
      controller.abort();
    }, FRAMEWORK_SERVER_TIMEOUT_MS);

    console.info(`[generate-framework:${requestId}] Claude outline call started`, {
      selectedFocusAreas: researchInput.selectedFocusAreas,
      selectedFocusAreaCount: researchInput.selectedFocusAreas.length,
      promptLength: prompt.length,
      model: "claude-sonnet-4-6",
      maxTokens,
      serverTimeoutMs: FRAMEWORK_SERVER_TIMEOUT_MS,
      keyPlayersOnly: isKeyPlayersOnly(researchInput),
    });

    let message;
    try {
      message = await createAnthropicMessage(
        resolvedApiKey,
        {
          model: "claude-sonnet-4-6",
          max_tokens: maxTokens,
          temperature: 0.2,
          messages: [{ role: "user", content: prompt }],
        },
        controller.signal
      );
    } catch (err) {
      if (serverTimeoutFired) {
        const fallbackFramework = buildFallbackFramework(researchInput);
        console.error(`[generate-framework:${requestId}] Claude outline call timed out`, {
          durationMs: durationMs(attemptStartedAt),
          totalDurationMs: durationMs(startedAt),
          selectedFocusAreaCount: researchInput.selectedFocusAreas.length,
          keyPlayersOnly: isKeyPlayersOnly(researchInput),
          promptLength: prompt.length,
          maxTokens,
          error: errorDetails(err),
        });
        return jsonErrorWithFallback(
          "Framework outline generation timed out before Netlify could return a platform 502. 已提供可編輯 fallback 大綱，請先確認方向或稍後重試。",
          504,
          requestId,
          fallbackFramework
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

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
      selectedFocusAreaCount: researchInput.selectedFocusAreas.length,
      promptLength: prompt.length,
      maxTokens,
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
