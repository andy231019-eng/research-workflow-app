import type { UserResearchInput, ResearchFramework } from "@/types/research";

const GEOGRAPHY_LABEL: Record<string, string> = {
  global: "全球",
  us: "美國",
  china: "中國",
  europe: "歐洲",
  japan: "日本",
  taiwan: "台灣",
  southeast_asia: "東南亞",
  other: "其他",
};

const PURPOSE_LABEL: Record<string, string> = {
  quick_understanding: "快速了解產業",
  investment: "投資研究",
  strategy: "商業策略",
  market_entry: "市場進入",
  startup: "創業 / 新創",
  bd_supply_chain: "供應鏈 / BD",
  client_presentation: "客戶簡報",
  academic_research: "論文 / 研究",
  other: "其他",
};

const HORIZON_LABEL: Record<string, string> = {
  short_6_12m: "短期（6–12 個月）",
  medium_1_3y: "中期（1–3 年）",
  long_3_10y: "長期（3–10 年）",
  all: "全部時間尺度",
};

const DEPTH_LABEL: Record<string, string> = {
  quick_8_10_pages: "快速版（8–10 頁）",
  standard_12_15_pages: "標準版（12–15 頁）",
  deep_15_18_pages: "深度版（15–18 頁）",
};

const FRAMEWORK_LABEL: Record<string, string> = {
  auto_detect: "Auto-detect by Claude",
  saas_software: "SaaS / Software",
  semiconductor: "Semiconductor 半導體",
  platform_marketplace: "Platform / Marketplace",
  manufacturing: "Manufacturing 製造業",
  consumer_brand: "Consumer / Brand",
  financial_services: "Financial Services",
  healthcare_biotech_medtech: "Healthcare / Biotech / Medtech",
  energy_infrastructure: "Energy / Infrastructure",
};

const LANG_INSTRUCTION: Record<string, string> = {
  traditional_chinese: "Use Traditional Chinese (繁體中文) throughout.",
  english: "Use English throughout.",
  bilingual: "Use Traditional Chinese as primary, with key English terms in parentheses.",
};

const SPECIAL_FRAMEWORK_EXTRA: Record<string, string> = {
  saas_software: `For SaaS/Software, also require: ARR, NRR, churn rate, CAC, LTV, payback period, Rule of 40, PLG motion, AI-native disruption risk, seat-based vs usage-based pricing.`,
  semiconductor: `For Semiconductor, also require: process node, fab utilization, wafer capacity, ASP trends, inventory cycle, capex supercycle, yield rates, HBM/CoWoS/advanced packaging, export control impact.`,
  platform_marketplace: `For Platform/Marketplace, also require: GMV, take rate, liquidity, network effects (same-side vs cross-side), multi-homing risk, disintermediation risk, winner-takes-most dynamics.`,
  manufacturing: `For Manufacturing, also require: CapEx intensity, utilization rate, yield, automation penetration, raw material cost structure, customer concentration, production footprint, China+1 exposure.`,
  consumer_brand: `For Consumer/Brand, also require: brand equity, customer loyalty metrics, channel power, repeat purchase rate, pricing power, marketing efficiency (ROAS, CAC), private label risk.`,
  financial_services: `For Financial Services, also require: AUM, take rate, NIM, loss ratio, default rate, capital requirement, regulatory capital, risk management sophistication.`,
  healthcare_biotech_medtech: `For Healthcare/Biotech/Medtech, also require: clinical outcome data, regulatory approval pathway, reimbursement dynamics, patent life/cliff, pipeline value, physician adoption, payer dynamics.`,
  energy_infrastructure: `For Energy/Infrastructure, also require: capacity factor, utilization, LCOE, subsidy dependency, grid connection constraints, project finance structure, long-term contract dynamics.`,
};

function getFrameworkContext(input: UserResearchInput): {
  geo: string;
  purpose: string;
  specialExtra: string;
  langInstruction: string;
  focusAreasStr: string;
} {
  const geo = (input.geographies ?? [])
    .map((g) => (g === "other" && input.geographyOther ? input.geographyOther : GEOGRAPHY_LABEL[g] ?? g))
    .join("、") || "全球";

  const purpose =
    input.analysisPurpose === "other" && input.analysisPurposeOther
      ? input.analysisPurposeOther
      : PURPOSE_LABEL[input.analysisPurpose] ?? input.analysisPurpose;

  const specialExtra =
    input.specialIndustryFramework === "auto_detect"
      ? `Auto-detect the appropriate special framework. If this looks like SaaS, Semiconductor, Platform, Manufacturing, Consumer, Financial Services, Healthcare, or Energy, apply the relevant extra data requirements.`
      : (SPECIAL_FRAMEWORK_EXTRA[input.specialIndustryFramework] ?? "");

  return {
    geo,
    purpose,
    specialExtra,
    langInstruction: LANG_INSTRUCTION[input.language] ?? LANG_INSTRUCTION.traditional_chinese,
    focusAreasStr: input.selectedFocusAreas.join(", "),
  };
}

export function buildFrameworkOutlinePrompt(input: UserResearchInput): string {
  const { geo, purpose, specialExtra, langInstruction, focusAreasStr } = getFrameworkContext(input);
  const isKeyPlayersOnly =
    input.selectedFocusAreas.length === 1 && input.selectedFocusAreas[0] === "key_players";
  const pageCountRule = isKeyPlayersOnly
    ? "- Since the user selected only Key Players, produce 3-5 pages focused on player segmentation, competitive positioning, business model differences, and likely winners/risks."
    : "- Quick version: 5-6 pages. Standard version: 7-9 pages. Deep version: 10-12 pages.";
  const compactnessRule = isKeyPlayersOnly
    ? "- Keep this especially compact. Do not add market sizing, value chain, or trend pages unless they directly explain player differences."
    : "- Produce an integrated page outline that covers the selected focus areas without creating one page per focus area.";

  return `You are an institutional-grade Industry Research Agent.

TASK: Generate a LIGHTWEIGHT research framework outline, not the full detailed framework and not the final report.

The user needs to quickly verify whether the research direction and page structure are correct. Keep the output compact enough to complete quickly.

USER INPUT:
- Industry: ${input.industryName}
- Geography: ${geo}
- Analysis Purpose: ${purpose}
- Time Horizon: ${HORIZON_LABEL[input.timeHorizon] ?? input.timeHorizon}
- Output Depth: ${DEPTH_LABEL[input.outputDepth] ?? input.outputDepth}
- Selected Focus Areas: ${focusAreasStr}
- Special Industry Framework: ${FRAMEWORK_LABEL[input.specialIndustryFramework] ?? input.specialIndustryFramework}
${input.customFocus ? `- Custom Focus: ${input.customFocus}` : ""}

SPECIAL FRAMEWORK GUIDANCE:
${specialExtra}

LANGUAGE: ${langInstruction}

OUTPUT REQUIREMENTS:
Return ONLY valid JSON wrapped in <json>...</json> tags. No markdown, no explanation outside the tags.

Return this compact schema:
{
  "projectTitle": "string",
  "industryName": "string",
  "geography": "string",
  "analysisPurpose": "string",
  "timeHorizon": "string",
  "pages": [
    {
      "id": "page_001",
      "pageNumber": 1,
      "pageTitle": "string",
      "coreQuestion": "string",
      "mainMessageHypothesis": "string",
      "suggestedVisual": "string"
    }
  ]
}

OUTLINE RULES:
${compactnessRule}
${pageCountRule}
- Every page must be decision-oriented, not descriptive.
- Use consultant-style page titles that imply the decision or insight.
- Do NOT include requiredData, evidenceNeeded, suggestedSources, mustAnswer, possiblePlayers, or a detailed value chain in this step.
- Keep each field concise.`;
}

export function buildFrameworkDetailPrompt(
  framework: ResearchFramework,
  input: UserResearchInput,
  pagesToDetail: ResearchFramework["pages"]
): string {
  const { geo, purpose, specialExtra, langInstruction } = getFrameworkContext(input);
  const pagesStr = pagesToDetail
    .map(
      (p) => `
PAGE ${p.pageNumber}: ${p.pageTitle}
id: ${p.id}
Core Question: ${p.coreQuestion}
Main Message Hypothesis: ${p.mainMessageHypothesis}
Suggested Visual: ${p.suggestedVisual}`
    )
    .join("\n---");

  return `You are an institutional-grade Industry Research Agent.

TASK: Enrich ONLY the listed research framework pages with detailed planning fields. Do not write the final report.

PROJECT: ${framework.projectTitle}
INDUSTRY: ${framework.industryName}
GEOGRAPHY: ${geo || framework.geography}
PURPOSE: ${purpose || framework.analysisPurpose}
TIME HORIZON: ${framework.timeHorizon}

SPECIAL FRAMEWORK GUIDANCE:
${specialExtra}

PAGES TO ENRICH:
${pagesStr}

LANGUAGE: ${langInstruction}

OUTPUT REQUIREMENTS:
Return ONLY valid JSON wrapped in <json>...</json> tags. No markdown, no explanation outside the tags.

Return exactly this schema:
{
  "pages": [
    {
      "id": "same id as input",
      "pageNumber": 1,
      "pageTitle": "same or lightly improved title",
      "coreQuestion": "same or lightly improved question",
      "mainMessageHypothesis": "same or lightly improved hypothesis",
      "requiredData": ["3-5 concrete data points"],
      "evidenceNeeded": ["3-5 evidence tests"],
      "suggestedSources": ["3-5 source types or named sources"],
      "suggestedVisual": "specific chart/table idea",
      "analysisAngle": "one concise analysis angle",
      "mustAnswer": ["3-5 specific questions"]
    }
  ]
}

DETAIL RULES:
- Return details only for the listed pages.
- Preserve page ids so the app can merge the results.
- requiredData should be specific and measurable where possible.
- suggestedSources should be source categories or likely named sources, not fabricated URLs.
- Keep the response compact.`;
}

export function buildFrameworkPrompt(input: UserResearchInput): string {
  const { geo, purpose, specialExtra, langInstruction, focusAreasStr } = getFrameworkContext(input);

  return `You are an institutional-grade Industry Research Agent combining the roles of:
- Strategy Consultant (McKinsey / Bain / BCG)
- Industry Analyst (Goldman Sachs / Morgan Stanley)
- Equity Research Analyst (buy-side / sell-side)
- Commercial Due Diligence Expert (PE/M&A)
- Market Intelligence Analyst
- Business Model Analyst

Your job is NOT to describe an industry.
Your job is to help investors, consultants, executives, and founders understand:
1. Is this an attractive industry?
2. What is the true nature of this industry?
3. Which part of the value chain captures the profit pool?
4. Who has pricing power?
5. Which players have durable moats?
6. Which business models are most attractive or vulnerable?
7. What could disrupt the industry?
8. Where will value migrate over the next 3–5 years?
9. What is the market overestimating or underestimating?
10. Which KPIs should decision-makers track?

TASK: Generate a research framework (NOT the final report).

USER INPUT:
- Industry: ${input.industryName}
- Geography: ${geo}
- Analysis Purpose: ${purpose}
- Time Horizon: ${HORIZON_LABEL[input.timeHorizon] ?? input.timeHorizon}
- Output Depth: ${DEPTH_LABEL[input.outputDepth] ?? input.outputDepth}
- Selected Focus Areas: ${focusAreasStr}
- Special Industry Framework: ${FRAMEWORK_LABEL[input.specialIndustryFramework] ?? input.specialIndustryFramework}
${input.customFocus ? `- Custom Focus: ${input.customFocus}` : ""}

SPECIAL FRAMEWORK GUIDANCE:
${specialExtra}

LANGUAGE: ${langInstruction}

OUTPUT REQUIREMENTS:
Return ONLY valid JSON wrapped in <json>...</json> tags. No markdown, no explanation outside the tags. Match this exact schema:

{
  "projectTitle": "string",
  "industryName": "string",
  "geography": "string",
  "analysisPurpose": "string",
  "timeHorizon": "string",
  "industryDefinition": {
    "included": ["string"],
    "excluded": ["string"],
    "valueChain": {
      "upstream": ["string"],
      "midstream": ["string"],
      "downstream": ["string"]
    },
    "coreNatureOneLiner": "string",
    "framingNotes": ["string"]
  },
  "possiblePlayers": {
    "leaders": [
      { "name": "string", "geographyOrListing": "string", "ticker": "string", "role": "string", "whyRelevant": "string" }
    ],
    "challengers": [...],
    "disruptors": [...],
    "commodityPlayers": [...]
  },
  "pages": [
    {
      "id": "string (e.g. page_001)",
      "pageNumber": 1,
      "pageTitle": "string",
      "coreQuestion": "string",
      "mainMessageHypothesis": "string",
      "requiredData": ["string"],
      "evidenceNeeded": ["string"],
      "suggestedSources": ["string"],
      "suggestedVisual": "string",
      "analysisAngle": "string",
      "mustAnswer": ["string"]
    }
  ],
  "dataGapsToResolve": ["string"]
}

FRAMEWORK DESIGN RULES:
- Every page must be decision-oriented, not descriptive.
- Think like a McKinsey partner, Bain PE diligence expert, Goldman Sachs analyst, and buy-side PM.
- coreQuestion must be the strategic decision this page helps answer.
- mainMessageHypothesis must be a testable hypothesis (not a description).
- requiredData must list specific data points (market size numbers, margin ranges, player rankings, etc.).
- evidenceNeeded must list the kind of evidence that would prove or disprove the hypothesis.
- mustAnswer must list 3–5 specific questions the page MUST answer.
- Only include pages for the user's selected focus areas.
- Always include industry_definition and executive_summary pages regardless of selection.
- Page count should match the selected output depth.
- For geography ${geo}, prefer sources in the relevant local language + English.`;
}

export function buildReportPrompt(
  framework: ResearchFramework,
  input: UserResearchInput
): string {
  const langInstruction =
    LANG_INSTRUCTION[input.language] ?? LANG_INSTRUCTION.traditional_chinese;

  const pagesStr = framework.pages
    .map(
      (p) => `
PAGE ${p.pageNumber}: ${p.pageTitle}
Core Question: ${p.coreQuestion}
Main Message Hypothesis: ${p.mainMessageHypothesis}
Required Data: ${p.requiredData.join(" | ")}
Evidence Needed: ${p.evidenceNeeded.join(" | ")}
Suggested Sources: ${p.suggestedSources.join(" | ")}
Suggested Visual: ${p.suggestedVisual}
Analysis Angle: ${p.analysisAngle}
Must Answer: ${p.mustAnswer.join(" | ")}`
    )
    .join("\n---");

  const playersStr = [
    ...framework.possiblePlayers.leaders.map((p) => `[Leader] ${p.name} (${p.geographyOrListing ?? ""}${p.ticker ? ` / ${p.ticker}` : ""}): ${p.whyRelevant}`),
    ...framework.possiblePlayers.challengers.map((p) => `[Challenger] ${p.name}: ${p.whyRelevant}`),
    ...framework.possiblePlayers.disruptors.map((p) => `[Disruptor] ${p.name}: ${p.whyRelevant}`),
    ...framework.possiblePlayers.commodityPlayers.map((p) => `[Commodity] ${p.name}: ${p.whyRelevant}`),
  ].join("\n");

  return `You are an institutional-grade Industry Research Agent.

The user has confirmed a research framework. Now generate a complete Markdown industry research report.

PROJECT TITLE: ${framework.projectTitle}
INDUSTRY: ${framework.industryName}
GEOGRAPHY: ${framework.geography}
PURPOSE: ${framework.analysisPurpose}
TIME HORIZON: ${framework.timeHorizon}

INDUSTRY DEFINITION:
- Included: ${framework.industryDefinition.included.join(", ")}
- Excluded: ${framework.industryDefinition.excluded.join(", ")}
- Core Nature: ${framework.industryDefinition.coreNatureOneLiner}
- Upstream: ${framework.industryDefinition.valueChain.upstream.join(", ")}
- Midstream: ${framework.industryDefinition.valueChain.midstream.join(", ")}
- Downstream: ${framework.industryDefinition.valueChain.downstream.join(", ")}

KEY PLAYERS:
${playersStr}

DATA GAPS TO RESOLVE: ${framework.dataGapsToResolve.join(", ")}

CONFIRMED RESEARCH PAGES:
${pagesStr}

LANGUAGE: ${langInstruction}

CRITICAL RULES:
- Use Claude's web search capability if available to find current, reliable data.
- STRICT INVESTMENT COMMITTEE ACCURACY MODE IS ON.
- Every important claim MUST have a source and a matching entry in the JSON sources array.
- Every number, ranking, market size, growth rate, company financial, regulation, share, valuation, and dated fact MUST have a source.
- Do NOT invent sources. Do NOT invent exact market size numbers if not found.
- Every source URL must be a real direct http(s) link from web search results or a known official/public source page. Do not fabricate URL slugs.
- Source dates must be formatted as yyyy-mm-dd. If only month is known, use yyyy-mm-01. If only year is known, use yyyy-01-01.
- If public data is limited, clearly state: "目前公開資料有限，無法可靠判斷。"
- Distinguish primary-source facts, estimates/forecasts, author inference, and judgment. Mark inferences clearly and state which sourced facts support them.
- The Fact section can ONLY contain primary facts or professional/financial database evidence with clear source links. Broker models, market research estimates, media second-hand reports, blogs, and author reasoning MUST NOT appear under Fact.
- Broker EPS/GM forecasts, target prices, future margin assumptions, market share forecasts, capacity forecasts, supply/demand gap estimates, and TAM/CAGR estimates must be labeled as Estimate / 機構或二手估計.
- Author causal claims, winner/loser views, "structural not cyclical" claims, and competitive timing assumptions must be labeled as Inference / 作者推論.
- If a source is a media repost of a broker or industry rumor and no original PDF/official disclosure is found, label it in the prose as an estimate or unverified item and move it to Data Gaps if it is material.
- For conflicting figures, report a conservative range or say sources conflict. Do not choose the most optimistic single number.
- Unsupported claims MUST NOT appear in Fact, Judgment, So What, or Final Industry Conclusion. Move them to Data Gaps instead.
- The JSON sources array MUST contain only verified or partial evidence. If a claim would be unsupported, omit it from the report body and add it to dataGaps.
- Partial evidence is allowed only when the report clearly labels it as limited/partial and avoids strong conclusions.
- Every section MUST include: Fact / 一級來源事實 → Estimate / 機構或二手估計 → Inference / 作者推論 → So What / 投資或策略意涵 → Data Gaps / 待查證事項.
- The report must answer: Is this an attractive industry? Where is the profit pool? Who wins?
- No encyclopedic descriptions. No pure news summaries. No opinion without data.
- No vague adjectives. Cite specific numbers, percentages, company names.

SOURCE PRIORITY:
Tier 1 (Most Reliable): Annual Reports, Investor Presentations, Earnings Calls, SEC Filings, Government Statistics, Regulator Data
Tier 2: Gartner, IDC, McKinsey, Bain, BCG, Deloitte, PwC, TrendForce, Counterpoint, SemiAnalysis
Tier 3: Statista, Grand View Research, PitchBook, Preqin, MarketsandMarkets
Tier 4: Reuters, Bloomberg, WSJ, Financial Times, Nikkei, The Information, CNBC, Industry Media
Tier 5 (only for tech/software/AI industries): GitHub, Hacker News, Reddit, Developer forums

SEARCH LANGUAGE RULE:
- US/Global: English
- Japan: Japanese + English
- Korea: Korean + English
- China: Simplified Chinese + English
- Taiwan: Traditional Chinese + English
- Europe: English + relevant local language

REQUIRED MARKDOWN REPORT STRUCTURE:

# ${framework.projectTitle}

## 0. Industry Definition 產業定義

### 產業範圍
[What is included and excluded]

### Value Chain 初步拆解
| 環節 | 內容 | 主要玩家 | 經濟性判斷 |
|---|---|---|---|

### 這個產業的本質一句話
> [One powerful sentence]

---

[Then for EACH confirmed page in order, write a full section with:]

## [pageNumber]. [pageTitle]

### Fact / 一級來源事實
[Only primary-source facts or professional/financial database evidence with direct source links]

### Estimate / 機構或二手估計
[Broker, market research, media-transcribed, or database estimates. Mark clearly as estimates.]

### Inference / 作者推論
[Analytical interpretation. Must cite which facts or estimates support the inference.]

### So What / 投資或策略意涵
[Implication for investors / strategists / founders]

### Data Gaps / 待查證事項
[Specific items that remain unverified, conflicted, or only second-hand]

### Suggested Visual
[Description of chart/table that would best show this]

### Sources / 資料來源
- [Source title](https://...) — Source Type — yyyy-mm-dd

Every section MUST include a Sources / 資料來源 block with 2-5 source bullets. Use this exact source format:
- [Digitimes：Semco's 2026 ABF capacity is fully booked](https://www.digitimes.com/news/a20251124PD204/semco-capacity-2026-abf-substrate-demand.html) — Industry Media — 2025-11-24

---

[Always end with these required sections:]

## KPIs to Watch 關鍵追蹤指標

| KPI | 為什麼重要 | 觀察頻率 | 正向訊號 | 負向訊號 |
|---|---|---|---|---|

---

## Supporting Facts & Sources 支撐資料與來源

| Claim | Source | Type | Date |
|---|---|---|---|

---

## Data Gaps 資料缺口

- [List what could not be verified from public sources]

---

## Final Industry Conclusion 最終產業結論

- **產業 Attractiveness：** Attractive / Neutral / Unattractive — [Reason]
- **長期趨勢：** [Direction]
- **最大機會：** [Specific opportunity]
- **最大風險：** [Specific risk]
- **未來 3–5 年最重要觀察點：** [What to watch]

---

RETURN FORMAT: Return the result as valid JSON wrapped in <json>...</json> tags, matching this structure:
<json>
{
  "title": "string",
  "markdown": "string (the full Markdown report)",
  "sources": [
    {
      "claim": "string",
      "sourceTitle": "string",
      "sourceUrl": "string",
      "sourceType": "Official Filing|Company Disclosure|Government / Regulator|Industry Research|Financial Database|Industry Media|News Media|Other",
      "date": "yyyy-mm-dd"
    }
  ],
  "dataGaps": ["string"]
}
</json>

STRICT OUTPUT VALIDATION RULES:
- sources must not be empty.
- Every source must include claim, sourceTitle, sourceUrl, sourceType, and date.
- sourceUrl must start with https:// or http://.
- date must be yyyy-mm-dd.
- Each section in markdown must include a "### Sources / 資料來源" block.
- Do not include reliability scores, confidence scores, evidenceStatus, evidenceClass, sourceTier, or crossCheckStatus in the JSON or markdown source table.
- Final Industry Conclusion must only summarize claims with listed sources or explicitly marked inferences.`;
}
