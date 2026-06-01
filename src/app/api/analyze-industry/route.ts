import { NextRequest, NextResponse } from "next/server";
import {
  resolveAnthropicApiKey,
  createAnthropicMessage,
  getFirstTextBlock,
  formatAnthropicError,
  getApiKeyDiagnostics,
} from "@/lib/anthropic";
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

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { industryName, geographies = [], geographyOther, apiKey: bodyApiKey } = body;

  if (!industryName?.trim()) {
    return NextResponse.json({ error: "industryName is required" }, { status: 400 });
  }

  let apiKey: string;
  try {
    apiKey = resolveAnthropicApiKey(bodyApiKey);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "API Key 錯誤",
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

請以 JSON 格式回答，只回 JSON，不要任何其他文字：
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
}`;

  try {
    const message = await createAnthropicMessage(apiKey, {
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = getFirstTextBlock(message);

    let parsed: SubcategoryResponse;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      parsed = JSON.parse(jsonMatch[0]) as SubcategoryResponse;
    } catch {
      return NextResponse.json(
        { error: "Claude 回應格式錯誤，請再試一次。" },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed.subcategories) || parsed.subcategories.length === 0) {
      return NextResponse.json(
        { error: "Claude 未能產生子分類，請再試一次。" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const message = formatAnthropicError(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
