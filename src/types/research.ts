export type AnalysisPurpose =
  | "quick_understanding"
  | "investment"
  | "strategy"
  | "market_entry"
  | "startup"
  | "bd_supply_chain"
  | "client_presentation"
  | "academic_research"
  | "other";

export type Geography =
  | "global"
  | "us"
  | "china"
  | "europe"
  | "japan"
  | "taiwan"
  | "southeast_asia"
  | "other";

export type TimeHorizon =
  | "short_6_12m"
  | "medium_1_3y"
  | "long_3_10y"
  | "all";

export type OutputDepth =
  | "quick_8_10_pages"
  | "standard_12_15_pages"
  | "deep_15_18_pages";

export type FocusArea =
  | "industry_definition"
  | "executive_summary"
  | "market_structure"
  | "industry_value_chain"
  | "industry_economics"
  | "key_players"
  | "competitive_dynamics"
  | "key_success_factors"
  | "secular_trends"
  | "growth_drivers"
  | "technology_innovation"
  | "regulation_external_factors"
  | "risks_disruption"
  | "industry_winners"
  | "market_expectations_vs_reality"
  | "investment_strategic_implications"
  | "kpis_to_watch"
  | "supporting_facts_sources";

export type SpecialIndustryFramework =
  | "auto_detect"
  | "saas_software"
  | "semiconductor"
  | "platform_marketplace"
  | "manufacturing"
  | "consumer_brand"
  | "financial_services"
  | "healthcare_biotech_medtech"
  | "energy_infrastructure";

export type OutputLanguage = "traditional_chinese" | "english" | "bilingual";

export type SearchDepth = "deep" | "standard" | "optional";

export const GEOGRAPHY_LABELS: Record<Geography, string> = {
  global: "全球",
  us: "美國",
  china: "中國",
  europe: "歐洲",
  japan: "日本",
  taiwan: "台灣",
  southeast_asia: "東南亞",
  other: "其他",
};

export interface UserResearchInput {
  industryName: string;
  geographies: Geography[];
  geographyOther?: string;
  analysisPurpose: AnalysisPurpose;
  analysisPurposeOther?: string;
  timeHorizon: TimeHorizon;
  outputDepth: OutputDepth;
  language: OutputLanguage;
  selectedFocusAreas: FocusArea[];
  focusAreaDepths?: Partial<Record<FocusArea, SearchDepth>>;
  specialIndustryFramework: SpecialIndustryFramework;
  customFocus?: string;
}

export interface Player {
  name: string;
  geographyOrListing?: string;
  ticker?: string;
  role: string;
  whyRelevant: string;
}

export interface FrameworkPage {
  id: string;
  pageNumber: number;
  pageTitle: string;
  coreQuestion: string;
  mainMessageHypothesis: string;
  requiredData: string[];
  evidenceNeeded: string[];
  suggestedSources: string[];
  suggestedVisual: string;
  analysisAngle: string;
  mustAnswer: string[];
}

export interface ResearchFramework {
  projectTitle: string;
  industryName: string;
  geography: string;
  analysisPurpose: string;
  timeHorizon: string;
  industryDefinition: {
    included: string[];
    excluded: string[];
    valueChain: {
      upstream: string[];
      midstream: string[];
      downstream: string[];
    };
    coreNatureOneLiner: string;
    framingNotes: string[];
  };
  possiblePlayers: {
    leaders: Player[];
    challengers: Player[];
    disruptors: Player[];
    commodityPlayers: Player[];
  };
  pages: FrameworkPage[];
  dataGapsToResolve: string[];
}

export interface SourceItem {
  claim: string;
  claimType: "fact" | "inference" | "judgment";
  sourceTitle: string;
  sourceUrl: string;
  sourceType:
    | "official"
    | "company"
    | "industry_report"
    | "market_data"
    | "media"
    | "community"
    | "other";
  date?: string;
  reliabilityScore: 1 | 2 | 3 | 4 | 5;
  evidenceStatus: "verified" | "partial" | "unsupported";
  notes?: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  markdown: string;
  sources: SourceItem[];
  dataGaps: string[];
  createdAt: string;
  geography?: string;
  analysisPurpose?: string;
  timeHorizon?: string;
  webSearchUsed?: boolean;
}

export type AppPhase =
  | "input"
  | "generating_framework"
  | "reviewing_framework"
  | "generating_report"
  | "report_ready"
  | "error";

export interface FocusAreaMeta {
  id: FocusArea;
  label: string;
  labelEn: string;
  description: string;
}

export const ALL_FOCUS_AREAS: FocusAreaMeta[] = [
  {
    id: "industry_definition",
    label: "產業定義",
    labelEn: "Industry Definition",
    description: "定義產業包含什麼、不包含什麼，以及產業本質",
  },
  {
    id: "executive_summary",
    label: "決策摘要",
    labelEn: "Executive Summary",
    description: "用 5–10 點回答這是不是好產業、誰最強、最大機會與風險",
  },
  {
    id: "market_structure",
    label: "市場結構",
    labelEn: "Market Structure",
    description: "分析 TAM、CAGR、集中度、pricing power、switching cost、scale economy",
  },
  {
    id: "industry_value_chain",
    label: "產業價值鏈",
    labelEn: "Industry Value Chain",
    description: "拆解上游、中游、下游，判斷哪個環節 profit pool 最大",
  },
  {
    id: "industry_economics",
    label: "產業經濟性",
    labelEn: "Industry Economics",
    description: "分析毛利率、營益率、ROIC、FCF、CapEx、working capital",
  },
  {
    id: "key_players",
    label: "主要玩家",
    labelEn: "Key Players",
    description: "分類 Leaders、Challengers、Disruptors、Commodity Players",
  },
  {
    id: "competitive_dynamics",
    label: "競爭結構",
    labelEn: "Competitive Dynamics",
    description: "分析產業是在拼技術、價格、通路、生態系、規模還是 regulation",
  },
  {
    id: "key_success_factors",
    label: "關鍵成功因素",
    labelEn: "Key Success Factors",
    description: "找出長期成功所需能力，如技術、成本、品牌、通路、資料、法規、資本",
  },
  {
    id: "secular_trends",
    label: "長期趨勢",
    labelEn: "Secular Trends",
    description: "分析 AI、Cloud、ESG、Automation、Demographics、Geopolitics 等結構性趨勢",
  },
  {
    id: "growth_drivers",
    label: "成長動能",
    labelEn: "Growth Drivers",
    description: "拆解成長來自 volume、ASP、penetration、geographic expansion、product mix",
  },
  {
    id: "technology_innovation",
    label: "技術與創新",
    labelEn: "Technology & Innovation",
    description: "分析技術演進、成熟度、專利、研發方向與技術替代風險",
  },
  {
    id: "regulation_external_factors",
    label: "法規與外部因素",
    labelEn: "Regulation & External Factors",
    description: "分析政策、補貼、出口管制、ESG、地緣政治、利率、匯率等",
  },
  {
    id: "risks_disruption",
    label: "風險與顛覆",
    labelEn: "Risks & Disruption",
    description: "分析需求、供給、價格、技術、AI、中國競爭、法規、地緣政治等風險",
  },
  {
    id: "industry_winners",
    label: "誰會贏",
    labelEn: "Industry Winners",
    description: "判斷長期贏家、最強商業模式、最可持續 moat，以及可能輸家",
  },
  {
    id: "market_expectations_vs_reality",
    label: "市場預期差",
    labelEn: "Market Expectations vs Reality",
    description: "分析市場 currently believes 什麼，reality may be 什麼，提出 variant view",
  },
  {
    id: "investment_strategic_implications",
    label: "投資與策略啟示",
    labelEn: "Investment / Strategic Implications",
    description: "回答哪個環節值得關注、哪裡有超額利潤、哪些商業模式危險",
  },
  {
    id: "kpis_to_watch",
    label: "關鍵追蹤指標",
    labelEn: "KPIs to Watch",
    description: "列出投資人與策略團隊未來要持續追蹤的 KPI",
  },
  {
    id: "supporting_facts_sources",
    label: "支撐資料與來源",
    labelEn: "Supporting Facts & Sources",
    description: "列出每個重要 claim 的來源、可靠度與資料缺口",
  },
];

export interface SpecialFrameworkMeta {
  id: SpecialIndustryFramework;
  label: string;
  description: string;
}

const PURPOSE_FOCUS_MAP: Partial<Record<AnalysisPurpose, {
  required: FocusArea[];
  optional: FocusArea[];
  deepen: FocusArea[];
}>> = {
  investment: {
    required: [
      "industry_definition", "executive_summary", "market_structure",
      "industry_value_chain", "industry_economics", "key_players",
      "competitive_dynamics", "key_success_factors", "secular_trends",
      "growth_drivers", "risks_disruption", "industry_winners",
      "market_expectations_vs_reality", "investment_strategic_implications",
      "kpis_to_watch", "supporting_facts_sources",
    ],
    optional: ["technology_innovation", "regulation_external_factors"],
    deepen: [
      "executive_summary", "market_structure", "industry_value_chain",
      "industry_economics", "key_players", "competitive_dynamics",
      "key_success_factors", "secular_trends", "growth_drivers",
      "risks_disruption", "industry_winners", "market_expectations_vs_reality",
      "investment_strategic_implications", "kpis_to_watch", "supporting_facts_sources",
    ],
  },
  strategy: {
    required: [
      "industry_definition", "executive_summary", "market_structure",
      "industry_value_chain", "industry_economics", "key_players",
      "competitive_dynamics", "key_success_factors", "secular_trends",
      "growth_drivers", "risks_disruption",
      "investment_strategic_implications", "kpis_to_watch", "supporting_facts_sources",
    ],
    optional: [
      "technology_innovation", "regulation_external_factors",
      "industry_winners", "market_expectations_vs_reality",
    ],
    deepen: [
      "market_structure", "industry_value_chain", "competitive_dynamics",
      "key_success_factors", "growth_drivers", "investment_strategic_implications",
    ],
  },
  market_entry: {
    required: [
      "industry_definition", "executive_summary", "market_structure",
      "industry_value_chain", "key_players", "competitive_dynamics",
      "key_success_factors", "growth_drivers", "regulation_external_factors",
      "risks_disruption", "investment_strategic_implications",
      "kpis_to_watch", "supporting_facts_sources",
    ],
    optional: [
      "industry_economics", "secular_trends", "technology_innovation",
      "industry_winners", "market_expectations_vs_reality",
    ],
    deepen: [
      "market_structure", "competitive_dynamics", "key_success_factors",
      "growth_drivers", "regulation_external_factors", "investment_strategic_implications",
    ],
  },
  startup: {
    required: [
      "industry_definition", "executive_summary", "market_structure",
      "industry_value_chain", "key_players", "competitive_dynamics",
      "key_success_factors", "secular_trends", "growth_drivers",
      "technology_innovation", "risks_disruption", "industry_winners",
      "investment_strategic_implications", "kpis_to_watch", "supporting_facts_sources",
    ],
    optional: [
      "industry_economics", "regulation_external_factors", "market_expectations_vs_reality",
    ],
    deepen: [
      "market_structure", "technology_innovation", "risks_disruption",
      "growth_drivers", "investment_strategic_implications",
    ],
  },
  bd_supply_chain: {
    required: [
      "industry_definition", "market_structure", "industry_value_chain",
      "key_players", "competitive_dynamics", "key_success_factors",
      "growth_drivers", "risks_disruption",
      "investment_strategic_implications", "kpis_to_watch", "supporting_facts_sources",
    ],
    optional: [
      "executive_summary", "industry_economics", "secular_trends",
      "technology_innovation", "regulation_external_factors",
      "industry_winners", "market_expectations_vs_reality",
    ],
    deepen: [
      "industry_value_chain", "key_players", "risks_disruption",
      "investment_strategic_implications",
    ],
  },
  quick_understanding: {
    required: [
      "industry_definition", "executive_summary", "market_structure",
      "industry_value_chain", "key_players", "secular_trends",
      "growth_drivers", "risks_disruption", "kpis_to_watch", "supporting_facts_sources",
    ],
    optional: [
      "industry_economics", "competitive_dynamics", "key_success_factors",
      "technology_innovation", "regulation_external_factors",
      "industry_winners", "investment_strategic_implications", "market_expectations_vs_reality",
    ],
    deepen: ["executive_summary", "market_structure", "key_players"],
  },
  client_presentation: {
    required: [
      "industry_definition", "executive_summary", "market_structure",
      "industry_value_chain", "key_players", "competitive_dynamics",
      "key_success_factors", "secular_trends", "growth_drivers",
      "risks_disruption", "investment_strategic_implications",
      "kpis_to_watch", "supporting_facts_sources",
    ],
    optional: [
      "industry_economics", "technology_innovation", "regulation_external_factors",
      "industry_winners", "market_expectations_vs_reality",
    ],
    deepen: [
      "executive_summary", "market_structure", "growth_drivers",
      "investment_strategic_implications",
    ],
  },
  academic_research: {
    required: [
      "industry_definition", "market_structure", "industry_value_chain",
      "key_players", "secular_trends", "growth_drivers", "risks_disruption",
      "kpis_to_watch", "supporting_facts_sources",
    ],
    optional: [
      "executive_summary", "industry_economics", "competitive_dynamics",
      "key_success_factors", "technology_innovation", "regulation_external_factors",
      "industry_winners", "market_expectations_vs_reality", "investment_strategic_implications",
    ],
    deepen: ["industry_definition", "secular_trends", "kpis_to_watch", "supporting_facts_sources"],
  },
};

export function getPurposeFocusDefaults(purpose: AnalysisPurpose): {
  selected: FocusArea[];
  depths: Partial<Record<FocusArea, SearchDepth>>;
} {
  const map = PURPOSE_FOCUS_MAP[purpose];
  const depths: Partial<Record<FocusArea, SearchDepth>> = {};

  if (!map) {
    for (const f of ALL_FOCUS_AREAS) depths[f.id] = "standard";
    return { selected: ALL_FOCUS_AREAS.map((f) => f.id), depths };
  }

  for (const id of map.required) {
    depths[id] = map.deepen.includes(id) ? "deep" : "standard";
  }
  for (const f of ALL_FOCUS_AREAS) {
    if (!map.required.includes(f.id)) depths[f.id] = "optional";
  }
  return { selected: [...map.required], depths };
}

export const SPECIAL_FRAMEWORKS: SpecialFrameworkMeta[] = [
  {
    id: "auto_detect",
    label: "Auto-detect by Claude",
    description: "讓 Claude 根據產業自動判斷要套用哪種特殊框架",
  },
  {
    id: "saas_software",
    label: "SaaS / Software",
    description: "額外分析 ARR、NRR、churn、CAC、LTV、payback period、Rule of 40、PLG、AI-native disruption",
  },
  {
    id: "semiconductor",
    label: "Semiconductor 半導體",
    description: "額外分析 node、utilization、wafer capacity、ASP、inventory cycle、capex cycle、yield、export control",
  },
  {
    id: "platform_marketplace",
    label: "Platform / Marketplace 平台",
    description: "額外分析 GMV、take rate、liquidity、network effect、multi-homing、disintermediation",
  },
  {
    id: "manufacturing",
    label: "Manufacturing 製造業",
    description: "額外分析 CapEx、utilization、yield、automation、raw material cost、customer concentration",
  },
  {
    id: "consumer_brand",
    label: "Consumer / Brand 消費品牌",
    description: "額外分析 brand equity、customer loyalty、channel power、repeat purchase、pricing power",
  },
  {
    id: "financial_services",
    label: "Financial Services 金融服務",
    description: "額外分析 AUM、take rate、NIM、loss ratio、default rate、capital requirement",
  },
  {
    id: "healthcare_biotech_medtech",
    label: "Healthcare / Biotech / Medtech",
    description: "額外分析 clinical outcome、regulatory approval、reimbursement、patent life、pipeline",
  },
  {
    id: "energy_infrastructure",
    label: "Energy / Infrastructure",
    description: "額外分析 capacity、utilization、LCOE、subsidy、grid connection、project finance",
  },
];
