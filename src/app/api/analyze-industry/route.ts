import { NextRequest, NextResponse } from "next/server";
import {
  resolveAnthropicApiKey,
  createAnthropicMessage,
  getFirstTextBlock,
  formatAnthropicError,
  getApiKeyDiagnostics,
} from "@/lib/anthropic";
import { generateId, tryParseJson } from "@/lib/utils";
import type { IndustrySubcategory } from "@/types/research";

const GEOGRAPHY_LABEL: Record<string, string> = {
  global: "全球",
  us: "美國",
  china: "中國",
  europe: "歐洲",
  japan: "日本",
  taiwan: "台灣",
  southeast_asia: "東南亞",
};

interface RequestBody {
  industryName: string;
  geographies: string[];
  geographyOther?: string;
  apiKey?: string;
}

interface SubcategoryResponse {
  subcategories: IndustrySubcategory[];
}

function jsonError(error: string, status: number, requestId: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, requestId, ...extra }, { status });
}

function validateSubcategoryResponse(parsed: SubcategoryResponse | null): parsed is SubcategoryResponse {
  if (!parsed || !Array.isArray(parsed.subcategories) || parsed.subcategories.length === 0) {
    return false;
  }

  return parsed.subcategories.every((item) => {
    return (
      typeof item.id === "string" &&
      item.id.trim().length > 0 &&
      typeof item.name === "string" &&
      item.name.trim().length > 0 &&
      typeof item.nameEn === "string" &&
      item.nameEn.trim().length > 0 &&
      typeof item.description === "string" &&
      item.description.trim().length > 0 &&
      Array.isArray(item.examples)
    );
  });
}

function normalizeSubcategories(parsed: SubcategoryResponse): SubcategoryResponse {
  return {
    subcategories: parsed.subcategories.slice(0, 6).map((item, index) => ({
      id: item.id.trim() || `subcategory_${index + 1}`,
      name: item.name.trim(),
      nameEn: item.nameEn.trim(),
      description: item.description.trim(),
      examples: item.examples.map((example) => String(example).trim()).filter(Boolean).slice(0, 5),
    })),
  };
}

export async function POST(req: NextRequest) {
  const requestId = generateId();
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonError("Invalid request body", 400, requestId);
  }

  const { industryName, geographies = [], geographyOther, apiKey: bodyApiKey } = body;

  if (!industryName?.trim()) {
    return jsonError("industryName is required", 400, requestId);
  }

  let apiKey: string;
  try {
    apiKey = resolveAnthropicApiKey(bodyApiKey);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "API Key 錯誤",
        requestId,
        diagnostics: getApiKeyDiagnostics(bodyApiKey),
      },
      { status: 401 }
    );
  }

  const geoLabel = geographies
    .map((g) => (g === "other" && geographyOther ? geographyOther : GEOGRAPHY_LABEL[g] ?? g))
    .join("、") || "全球";

  const prompt = `你是一位頂尖的產業分析師。使用者想研究「${industryName}」，地理範圍為「${geoLabel}」。

請將這個產業拆解成 4–6 個有意義的子分類，讓使用者選擇要深入研究哪個子分類。

子分類設計原則：
- 每個子分類要有清晰邊界，互不重疊
- 合計能覆蓋整個母產業
- 子分類粒度要實際可研究（不要太大也不要太細碎）
- 名稱要直覺，讓非專家也看得懂
- 考慮地理特性（例如日本 SaaS 要考慮 SMB vs Enterprise 的日本特殊結構）

請以 JSON 格式回答，只回 <json>...</json>，不要任何其他文字：
<json>
{
  "subcategories": [
    {
      "id": "snake_case_id",
      "name": "中文名稱（4–8 字）",
      "nameEn": "English Name",
      "description": "一句話說明這個子分類的特色與邊界（30–60 字）",
      "examples": ["代表性例子1", "代表性例子2", "代表性例子3"]
    }
  ]
}
</json>`;

  try {
    const message = await createAnthropicMessage(apiKey, {
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = getFirstTextBlock(message);
    let parsed = tryParseJson<SubcategoryResponse>(rawText);

    if (!validateSubcategoryResponse(parsed)) {
      console.warn(`[analyze-industry:${requestId}] initial JSON parse or validation failed`, {
        responseLength: rawText.length,
        responsePreview: rawText.slice(0, 500),
      });

      const repairMessage = await createAnthropicMessage(apiKey, {
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: `Convert the following response into ONLY valid JSON wrapped in <json>...</json>. Do not add commentary. Required schema:
{
  "subcategories": [
    {
      "id": "snake_case_id",
      "name": "中文名稱",
      "nameEn": "English Name",
      "description": "中文說明",
      "examples": ["例子1", "例子2", "例子3"]
    }
  ]
}

Original response:
${rawText}`,
          },
        ],
      });
      parsed = tryParseJson<SubcategoryResponse>(getFirstTextBlock(repairMessage));
    }

    if (!validateSubcategoryResponse(parsed)) {
      return jsonError("Claude 回應格式錯誤，請再試一次。", 500, requestId, {
        responsePreview: rawText.slice(0, 300),
      });
    }

    return NextResponse.json(normalizeSubcategories(parsed));
  } catch (err) {
    const message = formatAnthropicError(err);
    return jsonError(message, 500, requestId);
  }
}
