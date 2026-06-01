import type { ResearchFramework, GeneratedReport, IndustrySubcategory } from "@/types/research";

export const MOCK_SUBCATEGORIES: IndustrySubcategory[] = [
  {
    id: "vertical_saas",
    name: "垂直 SaaS",
    nameEn: "Vertical SaaS",
    description: "針對特定產業（醫療、建設、法律、餐飲等）深度整合的 SaaS，具有高切換成本與業務流程綁定。",
    examples: ["ANDPAD（建設）", "M3（醫療）", "SmartHR（HR）"],
  },
  {
    id: "horizontal_saas",
    name: "水平 SaaS",
    nameEn: "Horizontal SaaS",
    description: "跨產業通用功能型 SaaS，如會計、CRM、電子簽名、文件管理，市場廣但競爭激烈。",
    examples: ["freee（會計）", "Money Forward", "Sansan（名片管理）"],
  },
  {
    id: "ai_native_saas",
    name: "AI Native SaaS",
    nameEn: "AI-Native SaaS",
    description: "以 AI / LLM 為核心能力打造的新一代 SaaS，以 Agent 取代人工流程，對傳統 SaaS 形成顛覆性威脅。",
    examples: ["AI 客服 Agent", "自動化財報分析", "AI 法務合約審查"],
  },
  {
    id: "smb_saas",
    name: "中小企業 SaaS",
    nameEn: "SMB SaaS",
    description: "專注服務日本中小企業的 SaaS，以低價、易用、本地化服務為核心，滲透率仍低但市場龐大。",
    examples: ["会計freee", "Misoca", "Airレジ"],
  },
  {
    id: "enterprise_saas",
    name: "大型企業 SaaS",
    nameEn: "Enterprise SaaS",
    description: "服務日本大型企業，通常透過 SIer 代理銷售，導入週期長、合約金額高、客製化程度高。",
    examples: ["Salesforce Japan", "ServiceNow", "SAP S/4HANA"],
  },
];

export const MOCK_FRAMEWORK: ResearchFramework = {
  projectTitle: "日本 SaaS 產業商業策略深度分析",
  industryName: "日本企業 SaaS 產業",
  geography: "日本",
  analysisPurpose: "商業策略",
  timeHorizon: "中期（1–3 年）+ 長期（3–10 年）",
  industryDefinition: {
    included: [
      "企業 SaaS 訂閱軟體（會計、HR、CRM、建設管理、醫療情報）",
      "垂直 SaaS（建設・醫療・製造・法律等業務深度整合）",
      "Back-office AI 平台（SaaS 內嵌 AI Agent 功能）",
      "SIer 代理導入的 SaaS 解決方案",
    ],
    excluded: [
      "消費者 app（B2C SaaS）",
      "雲端基礎設施（IaaS/PaaS：AWS、Azure、GCP）",
      "純 on-premise 企業軟體及客製 SI 專案",
      "開發者工具（GitHub、Jira 等 DevOps 平台）",
    ],
    valueChain: {
      upstream: [
        "LLM / AI 模型供應商（OpenAI、Anthropic、Google、NTT）",
        "雲端基礎設施（AWS、Azure、GCP）",
        "資料儲存與整合工具（Snowflake、BigQuery）",
      ],
      midstream: [
        "Back-office SaaS 平台（freee、Money Forward、SmartHR）",
        "垂直 SaaS 廠商（ANDPAD、M3、Cybozu/kintone）",
        "SIer 整合通路（NTT Data、Fujitsu、NEC）",
      ],
      downstream: [
        "日本法人企業（SMB 直接採購、大企業 SIer 導入）",
        "會計師事務所、社勞士（Back-office SaaS 代理）",
        "IT 顧問與 AX Consulting 服務商",
      ],
    },
    coreNatureOneLiner:
      "日本 SaaS 是 AI 正在補足還沒數位化的企業人力流程——法規合規 × Domain Data × SIer 整合三重護城河，讓深度垂直 SaaS 成為難以被取代的產業基礎設施。",
    framingNotes: [
      "日本 SaaS 面對的不是美國的「SaaSpocalypse」問題，而是 DX 擴張期仍在進行中——兩個截然不同的市場框架",
      "AI 在日本主要取代的是「系統外的人工作業」（紙本、Excel、電話），而非 SaaS 本身的座位",
      "SIer 通路是觸及中大型企業的必要路徑，非 SaaS 廠商直接銷售可跳過的環節",
      "法規驅動採用（電子發票制度、電子帳簿保存法）是日本 SaaS 獨特的強制性成長觸媒",
    ],
  },
  possiblePlayers: {
    leaders: [
      {
        name: "freee",
        geographyOrListing: "日本 / TSE Growth",
        ticker: "4478",
        role: "中小企業會計／經營管理 SaaS",
        whyRelevant: "涵蓋發票、薪資、報稅全流程；AI Agent（Beta）嵌入多產品；與會計事務所深度整合，法規護城河強",
      },
      {
        name: "Money Forward",
        geographyOrListing: "日本 / TSE Prime",
        ticker: "3994",
        role: "財務 SaaS + AI Agent Platform",
        whyRelevant: "宣布 AI Vision 2025：AI Agent + AX Consulting；員工刷卡後 AI 自動生成費用申請，Hybrid Usage 計費轉型",
      },
      {
        name: "SmartHR",
        geographyOrListing: "日本（未上市）",
        role: "人事勞務 SaaS",
        whyRelevant: "直接映射日本勞務法規（雇用保險、社保）；AI FAQ bot 以合規資料護城河防守，generic LLM 難以取代",
      },
      {
        name: "Sansan",
        geographyOrListing: "日本 / TSE Prime",
        ticker: "4443",
        role: "名片／B2B 人脈管理 SaaS",
        whyRelevant: "名片 → B2B Intelligence Platform；企業關係圖 + 成交機率預測，AI 強化 B2B 情報護城河",
      },
    ],
    challengers: [
      {
        name: "ANDPAD",
        geographyOrListing: "日本（未上市）",
        role: "建設現場管理 SaaS",
        whyRelevant: "Stellarc AI：自動生成日報、預測延誤；建設 Domain Data 護城河深，AI 是巨大機會而非威脅",
      },
      {
        name: "M3",
        geographyOrListing: "日本 / TSE Prime",
        ticker: "2413",
        role: "醫療情報／MR 平台 SaaS",
        whyRelevant: "醫師 coverage + 醫療行為資料護城河；AI 個人化醫師資訊推播，傳統 MR 模式被壓縮而 M3 本身更強",
      },
      {
        name: "Cybozu / kintone",
        geographyOrListing: "日本 / TSE Prime",
        ticker: "4776",
        role: "低程式碼業務平台 SaaS",
        whyRelevant: "RAG 技術跨 App 自然語言問答；業務平台資料 Hub + 生態系，AI 強化跨部門整合",
      },
    ],
    disruptors: [
      {
        name: "AI-native 業務自動化新創",
        geographyOrListing: "日本（多家）",
        role: "特定流程自動化 AI",
        whyRelevant: "速度 + 靈活性切入傳統 SaaS 弱點，但缺乏法規責任承擔能力，護城河薄",
      },
    ],
    commodityPlayers: [
      {
        name: "SIer 自建 SaaS-like 工具",
        geographyOrListing: "日本",
        role: "客製化企業內部工具",
        whyRelevant: "搭載大廠 LLM（NTT/Fujitsu），保護現有客戶關係，但缺乏 SaaS 平台規模效應",
      },
      {
        name: "輕量單功能 SaaS（FAQ Bot、簡易 OCR）",
        geographyOrListing: "日本",
        role: "點狀工具",
        whyRelevant: "功能差異化低，易被 LLM API 或 Office+Copilot 直接取代，商業模式脆弱",
      },
    ],
  },
  pages: [
    {
      id: "page_001",
      pageNumber: 1,
      pageTitle: "產業定義：日本 SaaS 的邊界與本質",
      coreQuestion: "日本 SaaS 的範圍是什麼？與美國 SaaS 的本質差異在哪裡？為何「業務流程嵌入」比功能更重要？",
      mainMessageHypothesis:
        "日本 SaaS 的核心不是軟體功能，而是「法規合規 × 業務流程深度嵌入 × SIer 整合」三重護城河，使其更像產業基礎設施而非輕量工具。",
      requiredData: [
        "日本 SaaS 的產品邊界定義（訂閱制、雲端交付、日本法規合規）",
        "日本 vs 美國 SaaS 滲透率對比（SMB：34% vs 75%+）",
        "日本企業 SaaS 導入主要類別佔比（會計、HR、CRM、建設管理）",
        "SIer 通路在日本 SaaS 市場的佔比估算",
      ],
      evidenceNeeded: [
        "IPA 《DX動向2024》：60% 大企業已導入 SaaS 但「十分に使いこなせていない」",
        "日本 SaaS 市場分類定義（IDC Japan 或 経産省標準）",
        "Back-office SaaS vs Horizontal SaaS 的市場規模比較",
      ],
      suggestedSources: [
        "IPA《DX動向2024》",
        "経済産業省《DX推進指標》",
        "IDC Japan Cloud & SaaS Market Report",
        "freee / Money Forward 法說會產業定義部分",
      ],
      suggestedVisual: "日本 SaaS 生態系地圖（上游 AI/Cloud → 中游 SaaS 廠商 → 下游 SIer / 顧問 → 企業用戶）",
      analysisAngle: "以「能否承擔法規責任 + 是否擁有核心交易資料」作為界定日本 SaaS 護城河的關鍵標準",
      mustAnswer: [
        "日本 SaaS 的核心護城河與美國 SaaS 有何結構性不同？",
        "哪些類型的日本 SaaS 面臨 AI 替代風險最高？",
        "日本 SaaS 市場的自然邊界在哪裡（不適合 SaaS 化的業務）？",
      ],
    },
    {
      id: "page_002",
      pageNumber: 2,
      pageTitle: "決策摘要：日本 SaaS 是好產業嗎？",
      coreQuestion: "日本 SaaS 現在值得進入嗎？AI 對它是機會還是威脅？誰在市場裡最強？",
      mainMessageHypothesis:
        "日本 SaaS 是好產業——AI 不是殺手而是加速器，79 萬 IT 人力缺口讓 AI 成為企業存活工具，Back-office SaaS 仍有 7–10 年結構性成長窗口。",
      requiredData: [
        "市場規模：2024 年 1.4 兆日圓 → 2028 年 2 兆日圓（CAGR ~25%）",
        "SMB SaaS 採用率 ~34%（仍有大幅滲透空間）",
        "IT 人力缺口：2030 年 79 萬人",
        "2024 年因缺工倒閉企業 342 家（YoY +32%）",
        "AI 企業導入比例 57.7%（NRI 2025）",
      ],
      evidenceNeeded: [
        "頭部 SaaS 廠商 ARR 成長率（freee、MF、SmartHR 公開財報）",
        "NRI 調查：AI 導入首要目的為「業務效率化」而非取代 SaaS 本身",
        "日本 DX 推進進度：Level 3+ 企業僅 12.4%（仍大幅落後）",
      ],
      suggestedSources: [
        "NRI IT 活用調查 2025",
        "freee / Money Forward 財報（ARR 成長率）",
        "経産省《DX推進指標》自己診斷結果集計報告",
        "帝国データバンク 人手不足倒産調查 2024",
      ],
      suggestedVisual: "5 大核心判斷表：是否好產業 / 誰最強 / 最大機會 / 最大風險 / AI 對日本 SaaS 的角色",
      analysisAngle: "以「AI 是加速器還是顛覆者」為核心框架，與美國 SaaS 的 SaaSpocalypse 形成對比",
      mustAnswer: [
        "日本 SaaS 的黃金時代還有幾年？",
        "哪些企業類型（SMB vs 大企業）是最大成長動力？",
        "AI 普及後日本 SaaS 的護城河是否會加深或削弱？",
      ],
    },
    {
      id: "page_003",
      pageNumber: 3,
      pageTitle: "市場結構：規模、集中度與 Pricing Power",
      coreQuestion: "日本 SaaS 市場有多大、集中度如何、誰有定價權？滲透空間還有多少？",
      mainMessageHypothesis:
        "市場成熟度低（SMB 滲透 34%），結構性成長空間巨大；垂直 SaaS 的高 Switching Cost + 法規依賴，使頭部廠商享有持續的 Pricing Power。",
      requiredData: [
        "TAM 2024：~¥1.4 兆；2028 預估 ¥2 兆以上（CAGR ~25%）",
        "中小企業 SaaS 採用率：~34%（NIhonium 調查）",
        "大企業 SaaS 導入率：74.1%，但 60.7% 未充分使用",
        "雲端整體導入率：80.6%（令和 7 年版 白書）",
        "頭部 5 家廠商 5 年 CAGR：25%+（Rakus、Sansan、MF、freee 等）",
      ],
      evidenceNeeded: [
        "Back-office SaaS（會計/HR）的年流失率 vs 橫向 SaaS",
        "日本 SaaS 市場集中度 HHI 指數或 Top 5 市佔估算",
        "電子發票制度後的 SaaS 採用率加速數據",
      ],
      suggestedSources: [
        "IPA《DX動向2024》",
        "総務省《情報通信白書》令和 7 年版",
        "DX Magazine 調查 2024（大企業 SaaS 導入率）",
        "各公司財報：freee、Sansan、Money Forward、Rakus",
      ],
      suggestedVisual: "TAM 成長瀑布圖 + 市場集中度矩陣（垂直 SaaS vs 水平 SaaS）",
      analysisAngle: "從「滲透空間 × Switching Cost × 法規推力」三維度評估市場結構的吸引力",
      mustAnswer: [
        "日本 SaaS 市場何時會達到飽和點？",
        "中小企業 34% → 70% 滲透需要哪些條件？",
        "哪些細分市場的集中度最高、定價權最強？",
      ],
    },
    {
      id: "page_004",
      pageNumber: 4,
      pageTitle: "產業價值鏈：Profit Pool 在哪裡？",
      coreQuestion: "日本 SaaS 生態系中，哪個環節掌握最大 Profit Pool？AI 如何改變價值分配？",
      mainMessageHypothesis:
        "中游 SaaS 平台廠商是最大 Profit Pool，且 AI 正在進一步強化其地位——下游 BPO/人工流程被 AI 蠶食，SaaS 吸收更多價值；SIer 通路中期維持高利潤但長期面臨 AI 顧問取代。",
      requiredData: [
        "各環節毛利率估算：SaaS 中游 60-75% vs SIer 服務 30-40% vs BPO/人工服務 15-25%",
        "freee、Money Forward、SmartHR 的毛利率與 ARR 佔比（財報）",
        "SIer 在日本 IT 服務市場的收入規模（IDC Japan）",
        "BPO / 人工作業被 AI 替代的速度估算（NRI 調查）",
      ],
      evidenceNeeded: [
        "Money Forward 的 AX Consulting 收入佔比（新高毛利業務線）",
        "ANDPAD 現場管理 AI 節省人力成本的量化案例",
        "SIer 導入 SaaS 的加值空間（導入費 vs 年維護費結構）",
      ],
      suggestedSources: [
        "freee / Money Forward / SmartHR 財報（毛利率趨勢）",
        "IDC Japan IT サービス市場規模予測",
        "NRI《企業 IT 動向調查 2024》",
        "Money Forward AX Consulting 法說會資料",
      ],
      suggestedVisual: "價值鏈 Profit Pool 熱度圖（各環節毛利率 + 成長趨勢 + AI 衝擊方向）",
      analysisAngle: "核心邏輯：掌握「核心交易資料 + 法規合規責任」的環節才有長期定價權，其餘環節利潤被壓縮",
      mustAnswer: [
        "SaaS 廠商 vs SIer 的長期利潤結構會如何演變？",
        "AI Agent 普及後哪個環節的 Profit Pool 最先被壓縮？",
        "Back-office SaaS 的毛利率是否有進一步提升空間？",
      ],
    },
    {
      id: "page_005",
      pageNumber: 5,
      pageTitle: "產業經濟性：商業模式品質評估",
      coreQuestion: "日本 SaaS 的財務特徵如何？毛利、NRR、ROIC 能否支撐長期複利成長？",
      mainMessageHypothesis:
        "日本頭部 SaaS 的高毛利（60-75%）+ 高黏著 Back-office（低流失）+ AI Add-on Upsell = 結構性複利成長基礎；年費預付制改善現金流，但 R&D 和 S&M 費用仍高，獲利週期較長。",
      requiredData: [
        "毛利率：頭部廠商 60-75%（軟體部分；含 SI 服務則偏低）",
        "NRR：Back-office SaaS 估計 100-120%+（法說會未充分揭露）",
        "頭部廠商 5 年 ARR CAGR：25%+",
        "CAC 回收期：日本 SMB 通常 6-12 個月",
        "年費預付制占比（改善 Working Capital）",
      ],
      evidenceNeeded: [
        "freee、Money Forward 近 4 季毛利率趨勢",
        "Back-office SaaS 客戶流失率（Churn Rate）公開估算",
        "AI Add-on 定價模式：Money Forward、freee 已宣布的 Agent 費用方案",
      ],
      suggestedSources: [
        "freee 財報（Q1-Q4 FY2024）",
        "Money Forward 財報（ARR、NRR 趨勢）",
        "SaaS 業界レポート（SaaS Metrics 調查，taisa.substack）",
        "Rakus / Sansan 財報毛利率",
      ],
      suggestedVisual: "日本 SaaS 財務特徵雷達圖 vs 美國 SaaS 對照（毛利、NRR、CAC、ROIC、FCF）",
      analysisAngle: "從「商業模式可持續性」角度判斷，哪些日本 SaaS 已達到自我強化成長飛輪",
      mustAnswer: [
        "日本 SaaS 的 Rule of 40 表現如何？",
        "AI Add-on 是否能成為改善 NRR 的新動力？",
        "哪家廠商最接近真正的正向 FCF？",
      ],
    },
    {
      id: "page_006",
      pageNumber: 6,
      pageTitle: "主要玩家：誰有最深的護城河？",
      coreQuestion: "日本 SaaS 市場的競爭格局如何？哪些玩家的護城河最難被 AI 打穿？",
      mainMessageHypothesis:
        "freee、Money Forward、SmartHR 三大 Back-office SaaS 護城河最深（法規 + 資料 + SIer 通路）；ANDPAD、M3 在垂直 SaaS 領域具備 Domain Data 優勢；無差異化的水平工具面臨 AI 商品化風險。",
      requiredData: [
        "freee：ARR 規模、會計師事務所合作數、AI 功能佈局",
        "Money Forward：ARR、NRR、AX Consulting 收入、AI Vision",
        "SmartHR：ARR（未上市，估值 >¥1,000 億）、HR 法規整合深度",
        "ANDPAD：建設業 Domain Data 規模、Stellarc AI 功能",
        "M3：醫師 coverage 比率、RWE 平台 AI 整合",
      ],
      evidenceNeeded: [
        "各公司對 AI 功能的定位（是取代 SaaS 座位還是強化 SaaS 服務？）",
        "SIer 合作夥伴數量差異（freee vs Money Forward vs SmartHR）",
        "電子發票制度採用後各廠商新客戶增速",
      ],
      suggestedSources: [
        "freee / Money Forward / SmartHR / ANDPAD 法說會資料",
        "M3 財報（IR 資料）",
        "Cybozu / kintone App Market 資料",
        "IDC Japan SaaS Market Share 2024",
      ],
      suggestedVisual: "競爭者護城河矩陣：橫軸「AI 替代難易度」，縱軸「Domain Data 深度」",
      analysisAngle: "評分卡方法：法規合規能力 / Domain Data 積累 / SIer 通路廣度 / AI Agent 整合進度",
      mustAnswer: [
        "哪家日本 SaaS 護城河最深？Money Forward vs freee vs SmartHR？",
        "2028 年後日本 SaaS 的主要顛覆路徑是什麼？",
        "哪些日本 SaaS 反而因 AI 強化而競爭地位更高？",
      ],
    },
    {
      id: "page_007",
      pageNumber: 7,
      pageTitle: "競爭結構：AI 如何改變日本 SaaS 的競爭維度？",
      coreQuestion: "日本 SaaS 的競爭維度是什麼？AI 讓哪些競爭要素更重要、哪些被商品化？",
      mainMessageHypothesis:
        "競爭維度從「功能完整度」轉向「核心交易資料 + 法規合規責任 + SIer 通路 + AI Backend 能力」——AI 讓這四個要素的護城河更深，功能差異化反而加速商品化。",
      requiredData: [
        "Seat-based vs Hybrid Usage-based 定價趨勢（日本現況）",
        "MCP（Model Context Protocol）介面開放情況（日本 SaaS 廠商）",
        "SIer 通路在大企業 SaaS 採購的比例",
        "kintone App Market 生態系規模（第三方 App 數量）",
        "freee AI Agent Beta 功能的用戶反應數據",
      ],
      evidenceNeeded: [
        "「防禦式創新」策略案例：日本 SaaS 廠商如何將 AI 吸收進自身產品線",
        "競爭者分析：中國低價 SaaS 進入日本市場的嘗試與結果",
        "Usage-based 定價在日本的接受度（客戶年契約偏好調查）",
      ],
      suggestedSources: [
        "freee / Money Forward / ANDPAD 法說會（AI 定位說明）",
        "kintone パートナープログラム 資料",
        "NRI《企業の SaaS 導入動向》調查",
        "SaaS Metrics Japan Survey（taisa.substack）",
      ],
      suggestedVisual: "競爭維度轉移圖（Before AI vs After AI 的競爭要素重要性變化）",
      analysisAngle: "核心洞察：日本 SaaS 採「防禦式創新」（把 AI 吸收進自己產品線），而非創造 AI-native 替代品",
      mustAnswer: [
        "誰開放 MCP 介面成為 AI Backend，誰就占據未來競爭高地——現在進度如何？",
        "SIer 通路在 AI 時代的角色會強化還是弱化？",
        "日本 SaaS 定價模式從 Seat 走向 Usage/Hybrid 的時程預測？",
      ],
    },
    {
      id: "page_008",
      pageNumber: 8,
      pageTitle: "關鍵成功因素：長期勝出的能力條件",
      coreQuestion: "在日本 SaaS 市場長期勝出，必須具備哪些能力？AI 時代優先序是否改變？",
      mainMessageHypothesis:
        "四大 KSF 的優先序：①法規合規能力（無可替代）、②Domain Data 積累（AI 時代更重要）、③SIer 通路合作（觸及中大型企業必要路徑）、④AI Agent 整合能力（2025-2027 年成為新護城河）。",
      requiredData: [
        "法規更新速度 vs SaaS 廠商反應週期（電子發票 / 電子帳簿保存法案例）",
        "M3 醫療資料護城河：醫師 coverage 比例 + 醫療行為資料規模",
        "ANDPAD 建設 Domain Data：工程記錄條數 + AI 模型訓練資料規模",
        "各廠商 SIer 合作夥伴數量與覆蓋企業規模",
      ],
      evidenceNeeded: [
        "freee 快速應對法規更新的案例（電子發票後新客戶加速）",
        "AI Agent 功能對 NRR 的影響：Money Forward AX Consulting 收入貢獻",
        "無 SIer 通路的垂直 SaaS 在大企業客戶觸及上的困難",
      ],
      suggestedSources: [
        "freee / Money Forward 法說會（法規適應能力說明）",
        "M3 / ANDPAD IR 資料（Domain Data 說明）",
        "NTT Data / Fujitsu SaaS 合作說明文件",
        "日本 IT パートナー実態調查（MM Research）",
      ],
      suggestedVisual: "KSF 優先序雷達圖（前 AI 時代 vs AI 時代的能力重要性對比）",
      analysisAngle: "從「哪些能力被 AI 強化 vs 哪些被 AI 商品化」反推長期勝出條件",
      mustAnswer: [
        "AI Agent 整合能力什麼時候從「加分項」變成「必要條件」？",
        "新進入者最難複製的護城河是哪一個？",
        "資本效率最高的能力投資順序是什麼？",
      ],
    },
    {
      id: "page_009",
      pageNumber: 9,
      pageTitle: "長期趨勢：結構性成長的驅動力量",
      coreQuestion: "哪些結構性趨勢在驅動日本 SaaS 的長期成長？哪個趨勢的驅動力最強？",
      mainMessageHypothesis:
        "AI × 人口老化是最強結構性趨勢——2030 年 79 萬 IT 人力缺口讓 AI 成為企業存活工具，而非可選項；法規電子化是第二波強制性成長觸媒。",
      requiredData: [
        "IT 人力缺口：2030 年 79 萬人（経産省）",
        "2024 年因人手不足倒閉 342 家（YoY +32%）",
        "日本政府 AI / 半導體 10 年兆元投資計畫",
        "電子發票制度導入後的 SaaS 採用加速數據（2023-2024）",
        "DX Level 3+ 企業僅 12.4%（還有大量 DX 追趕需求）",
      ],
      evidenceNeeded: [
        "Demographics × AI 乘數效應：人口減少如何加速 AI SaaS 採用",
        "地緣政治對 Data Residency 要求的強化（偏好本地 SaaS）",
        "日本政府 ESG 資訊揭露要求對資料管理 SaaS 的需求拉動",
      ],
      suggestedSources: [
        "経産省《2030年のIT人材需給に関する調查》",
        "内閣府 AI 戦略 2025",
        "総務省《情報通信白書》令和 7 年版",
        "帝国データバンク 人手不足倒産調查 2024",
      ],
      suggestedVisual: "趨勢力量矩陣：橫軸「確定性」，縱軸「對日本 SaaS 的衝擊強度」",
      analysisAngle: "最強趨勢 = Demographics × AI 乘數效應，這是全球最獨特的「AI 必需品化」條件",
      mustAnswer: [
        "哪個結構性趨勢是日本獨有的？（差異化於全球 SaaS 分析）",
        "法規電子化的下一波觸媒是什麼（2025-2027）？",
        "人口老化對哪個 SaaS 細分市場衝擊最強？",
      ],
    },
    {
      id: "page_010",
      pageNumber: 10,
      pageTitle: "成長動能：成長從哪裡來？還有多少空間？",
      coreQuestion: "日本 SaaS 的成長分解：Volume、ASP、Penetration、Geographic、Product Mix 各貢獻多少？",
      mainMessageHypothesis:
        "SMB 滲透率從 34% 擴張至 70%+ 是最大 Volume 成長引擎；AI Add-on 的 ASP 提升是下一個 ARR 倍增器；Product Mix 從單一產品走向多模組平台是第三成長引擎。",
      requiredData: [
        "SMB SaaS 採用率：~34%（目標：70%+ 接近美國水準）",
        "AI Agent 模組 Premium 定價方案（Money Forward、freee 已宣布）",
        "freee 從會計擴展至 HR、融資的 Cross-sell ARR 增長",
        "地方中小企業 SaaS 觸及率 vs 都市企業（地方 SMB 仍大量未觸及）",
        "電子發票制度觸發的強制導入新客戶數量（2023-2024）",
      ],
      evidenceNeeded: [
        "頭部廠商的 NRR 數據（Upsell + Cross-sell 效果）",
        "AI Add-on 模組的實際 ARPU 提升幅度（Money Forward AX Consulting 案例）",
        "東南亞進入嘗試：freee 或 Money Forward 的亞洲擴張進度",
      ],
      suggestedSources: [
        "freee / Money Forward 法說會（ARR 成長拆解）",
        "Rakus / Sansan 財報（ARPU 趨勢）",
        "METI 中小企業 DX 支援補助金數據（採用加速效果）",
        "renue 調查：SaaS Usage-based 採用趨勢",
      ],
      suggestedVisual: "成長動能瀑布圖：Volume 滲透 + ASP 提升 + Product Mix + Geographic 各貢獻比例",
      analysisAngle: "反向驗證：若 SMB 滲透率 34% → 70% 是 5 年任務，則 ARR 成長的天花板遠比市場預期高",
      mustAnswer: [
        "AI Add-on 對 ARPU 的提升幅度有多大（2025-2027 預估）？",
        "地方 SMB 市場需要什麼通路突破才能被充分觸及？",
        "Product Platform 化（多模組）是否讓客戶 LTV 顯著提升？",
      ],
    },
    {
      id: "page_011",
      pageNumber: 11,
      pageTitle: "風險與顛覆：什麼會打斷成長？",
      coreQuestion: "哪些風險可能中斷日本 SaaS 的成長？AI 帶來的是威脅還是機會？",
      mainMessageHypothesis:
        "短期風險可控（Back-office SaaS 難被 AI 直接取代）；最大威脅是 2026-2028 年 AI Agent 普及後的 Seat 壓縮——但日本獨特的人力缺口使這個風險延後且強度較低。",
      requiredData: [
        "日本 SaaS 各細分市場的 AI 替代可行性評估（SOP 標準化程度）",
        "2026-2028 年 AI Agent 在日本大企業的部署速度預測",
        "輕量單功能 SaaS 的 Churn 加速數據（已有初步跡象）",
        "水平 SaaS vs Back-office SaaS 的客戶流失率對比",
      ],
      evidenceNeeded: [
        "美國 Seat compression 案例對日本的適用性分析（哪些成立、哪些不適用）",
        "中國低成本 SaaS 進入日本市場的嘗試與失敗原因",
        "AI 責任法規對 AI 取代法規性決策（會計、HR）的限制程度",
      ],
      suggestedSources: [
        "Gartner Market Insight：AI Agent Impact on SaaS（2025）",
        "IDC Japan AI 市場調查 2024",
        "美國 SaaS 財報（Atlassian Seat 數據，Salesforce NRR 趨勢）",
        "日本 AI 推進協議会 AI 活用實態調查",
      ],
      suggestedVisual: "風險矩陣：橫軸「發生機率」，縱軸「衝擊嚴重度」，標注各風險在 2025 / 2028 的位置",
      analysisAngle: "日本市場框架：人力缺口讓 AI Agent 成為「補人工具」而非「裁員工具」，降低 Seat 壓縮速度",
      mustAnswer: [
        "日本 Seat compression 會在哪一年成為主流問題？",
        "哪類日本 SaaS 最先被 AI 商品化（3 年內）？",
        "SIer 生態系的保護傘對大企業 SaaS 有多強的防禦作用？",
      ],
    },
    {
      id: "page_012",
      pageNumber: 12,
      pageTitle: "商業策略啟示：進入、定位與成長路徑",
      coreQuestion: "對進入日本 SaaS 市場的廠商或策略者，最重要的決策是什麼？哪裡有超額利潤？",
      mainMessageHypothesis:
        "最佳商業模式是「垂直 SaaS + AI（Domain Data × 法規合規）」；SIer 通路合作是觸及大企業的必要路徑；Seat-based + AI Add-on Hybrid 是最佳定價演進方向；應避開無差異化水平 SaaS。",
      requiredData: [
        "垂直 SaaS + AI（ANDPAD、M3 模式）的 ARR 成長率 vs 水平 SaaS",
        "AX Consulting（AI 轉型顧問服務）的毛利率 vs SaaS 訂閱（Money Forward 案例）",
        "SIer 合作帶來的大企業客戶 LTV vs 直銷 SMB 客戶 LTV",
        "Hybrid Usage-based 定價的 ARPU 提升效果",
      ],
      evidenceNeeded: [
        "Money Forward AX Consulting 的具體 Revenue 貢獻（法說會）",
        "沒有 SIer 通路的 SaaS 廠商在大企業市場的觸及困難（反例）",
        "「防禦式創新」策略（AI 吸收進產品線）vs 「AI 顛覆」策略的成功率對比",
      ],
      suggestedSources: [
        "Money Forward 法說會（AX Consulting 戰略說明）",
        "ANDPAD / M3 法說會（垂直 SaaS + AI 定位）",
        "McKinsey Japan Digital Report 2024",
        "Bain Japan SaaS Landscape Analysis",
      ],
      suggestedVisual: "戰略地圖：商業模式吸引力矩陣（垂直深度 × AI 整合程度 × 超額利潤潛力）",
      analysisAngle: "核心策略邏輯：在日本，「法規責任 + 資料護城河 + SIer 通路」三要素缺一不可，決定市場進入的優先序",
      mustAnswer: [
        "對外資 SaaS 進入日本市場，最大的結構性障礙是什麼？",
        "AX Consulting 模式（高毛利服務）是否可複製到其他 SaaS 廠商？",
        "2027 年最值得關注的新商業模式演化是什麼？",
      ],
    },
    {
      id: "page_013",
      pageNumber: 13,
      pageTitle: "關鍵追蹤指標：持續監控的 KPI",
      coreQuestion: "未來 3 年應追蹤哪些 KPI 以判斷日本 SaaS 的成長是否持續、風險是否實現？",
      mainMessageHypothesis:
        "最關鍵的追蹤指標是 NRR（AI Upsell 是否補足自然流失）和 MCP 介面開放率（誰在成為 AI Backend），這兩個指標決定 2027 年後的市場格局。",
      requiredData: [
        "NRR 趨勢：Back-office SaaS 各廠商季度數據",
        "AI Add-on 收入佔比：freee、Money Forward 各季披露",
        "SMB 新客數成長速度（DX 擴張期是否持續）",
        "MCP 介面開放廠商數量（日本 SaaS 生態系 AI 化進度）",
        "AI 企業導入率：從 57.7% 向 80%+ 推進速度",
      ],
      evidenceNeeded: [
        "Seat 數量是否開始出現壓縮跡象（警示信號）",
        "法規新變化觸發的採用加速（電子帳簿保存法下一波）",
        "SIer 主動推薦 SaaS + AI 方案的比例變化",
      ],
      suggestedSources: [
        "freee / Money Forward / Sansan 季報（NRR 追蹤）",
        "日本 SaaS 業界団体年度報告（SaaS 協会等）",
        "NRI IT 活用調查（年度更新）",
        "総務省《情報通信白書》年度版",
      ],
      suggestedVisual: "KPI Dashboard：NRR / AI 收入佔比 / SMB 新客增速 / MCP 開放率 四象限追蹤圖",
      analysisAngle: "以「正向訊號 vs 警示訊號」框架設計 KPI 監控體系，讓每季財報發布時可快速判讀",
      mustAnswer: [
        "哪個 KPI 最早反映日本 SaaS 成長放緩？",
        "AI Add-on 滲透率到多少算是市場已接受？",
        "MCP 介面開放的哪個臨界點代表 AI Backend 競爭格局確定？",
      ],
    },
    {
      id: "page_014",
      pageNumber: 14,
      pageTitle: "支撐資料與來源：數據品質與缺口",
      coreQuestion: "本研究使用的數據品質如何？哪些關鍵數據仍有缺口需要進一步驗證？",
      mainMessageHypothesis:
        "核心市場規模數據（政府統計 + 上市公司財報）可靠度高；NRR 和 AI Add-on 收入貢獻的公開披露仍不足，是本研究最大的數據缺口。",
      requiredData: [
        "市場規模：IPA、総務省白書、IDC Japan 多源交叉驗證",
        "企業 SaaS 導入率：NRI、経産省、DX Magazine 調查",
        "IT 人力缺口：経産省《DX人材確保・育成》官方數據",
        "各廠商財務數據：上市公司財報（freee、MF、Sansan、Rakus）",
      ],
      evidenceNeeded: [
        "Back-office SaaS NRR 數據（多數廠商未充分揭露）",
        "AI Add-on 收入佔比（2025 年才開始有初步揭露）",
        "地方 SMB SaaS 滲透率（城鄉差距數據不足）",
        "SIer 代理的 SaaS 採購金額占比（無公開統計）",
      ],
      suggestedSources: [
        "IPA《DX動向2024》（官方，可靠度最高）",
        "総務省《情報通信白書》令和 7 年版（官方）",
        "NRI IT 活用調查 2025（知名研究機構）",
        "freee / Money Forward / Sansan / Rakus 財報（上市公司公開資訊）",
        "Grand View Research Japan SaaS Market（市場研究，中等可靠度）",
      ],
      suggestedVisual: "資料可靠度矩陣（各主要數據點 × 來源類型 × 可靠度評分 1-5）",
      analysisAngle: "區分「事實」（有數據支撐）vs「推論」（邏輯推導）vs「判斷」（分析觀點），確保透明度",
      mustAnswer: [
        "哪些核心假設需要進一步數據驗證才能強化結論？",
        "AI Add-on 市場的公開數據何時會充分揭露（2025 Q3/Q4 財報）？",
        "本研究結論對哪些假設最敏感（敏感度分析）？",
      ],
    },
  ],
  dataGapsToResolve: [
    "日本 Back-office SaaS 的 NRR 數據多數廠商未充分揭露，難以精確評估 Upsell 動能",
    "AI Add-on 收入貢獻在 2025 年才開始有初步揭露，數據樣本仍不足",
    "地方中小企業 SaaS 滲透率（城鄉差距）缺乏精確調查數據",
    "SIer 代理的 SaaS 採購金額佔市場總規模的比例無公開統計",
    "日本 Seat compression 是否發生的臨界點尚無共識定義",
  ],
};

export const MOCK_REPORT: GeneratedReport = {
  id: "mock_report_001",
  title: "日本 SaaS 產業深度分析：商業策略視角（14 模組）",
  createdAt: new Date().toISOString(),
  sources: [
    {
      claim: "日本 SaaS 市場規模 2024 年 ¥1.4 兆，2028 年預估 ¥2 兆以上（CAGR ~25%）",
      claimType: "fact",
      sourceTitle: "Research Nester Japan SaaS Market Report 2024",
      sourceUrl: "https://www.researchnester.com",
      sourceType: "market_data",
      date: "2024",
      reliabilityScore: 3,
      evidenceStatus: "partial",
      notes: "中高可靠度，複數機構估計有差異",
    },
    {
      claim: "IPA 2024：僅 20% 企業 DX 有明確成果；60% 大企業已導入 SaaS 但「活用不足」",
      claimType: "fact",
      sourceTitle: "IPA《DX動向2024》情報処理推進機構",
      sourceUrl: "https://www.ipa.go.jp",
      sourceType: "official",
      date: "2024",
      reliabilityScore: 5,
      evidenceStatus: "verified",
    },
    {
      claim: "IT 人力缺口：2030 年 79 萬人；2024 年因缺工倒閉 342 家（YoY +32%）",
      claimType: "fact",
      sourceTitle: "経済産業省 DX 推進指標 + 帝国データバンク 2024",
      sourceUrl: "https://www.meti.go.jp",
      sourceType: "official",
      date: "2024",
      reliabilityScore: 5,
      evidenceStatus: "verified",
    },
    {
      claim: "企業 AI 導入比例 57.7%；AI 導入障礙首位為「リテラシー不足」（70.3%）",
      claimType: "fact",
      sourceTitle: "NRI IT 活用調查 2025（野村総合研究所）",
      sourceUrl: "https://www.nri.com",
      sourceType: "industry_report",
      date: "2025",
      reliabilityScore: 4,
      evidenceStatus: "verified",
    },
    {
      claim: "大企業 SaaS 導入率 74.1%，但 60.7% 認為「未充分使用」",
      claimType: "fact",
      sourceTitle: "DX Magazine 調查 2024",
      sourceUrl: "https://dx-mag.com",
      sourceType: "industry_report",
      date: "2024",
      reliabilityScore: 3,
      evidenceStatus: "partial",
    },
    {
      claim: "雲端整體導入率 80.6%（含 IaaS/PaaS/SaaS）",
      claimType: "fact",
      sourceTitle: "総務省《情報通信白書》令和 7 年版",
      sourceUrl: "https://www.soumu.go.jp",
      sourceType: "official",
      date: "2025",
      reliabilityScore: 5,
      evidenceStatus: "verified",
    },
    {
      claim: "中小企業 SaaS 採用率 ~34%",
      claimType: "fact",
      sourceTitle: "nihonium 中小企業デジタル化調查",
      sourceUrl: "https://nihonium.io",
      sourceType: "industry_report",
      date: "2024",
      reliabilityScore: 3,
      evidenceStatus: "partial",
      notes: "樣本範圍需確認",
    },
    {
      claim: "日本 AI Agent 市場 2028 年預估 ¥8,880 億（CAGR 49.9%）",
      claimType: "fact",
      sourceTitle: "Grand View Research Japan AI Agent Market",
      sourceUrl: "https://www.grandviewresearch.com",
      sourceType: "market_data",
      date: "2024",
      reliabilityScore: 2,
      evidenceStatus: "partial",
      notes: "預測模型，誤差範圍較大",
    },
  ],
  dataGaps: [
    "日本 Back-office SaaS 的 NRR 數據多數廠商未充分揭露，難以精確評估 Upsell 動能",
    "AI Add-on 收入貢獻在 2025 年才開始有初步揭露，數據樣本仍不足",
    "地方中小企業 SaaS 滲透率（城鄉差距）缺乏精確調查數據",
    "SIer 代理的 SaaS 採購金額佔市場總規模的比例無公開統計",
    "日本 Seat compression 是否發生的臨界點尚無共識定義",
  ],
  markdown: `# 日本 SaaS 產業深度分析：商業策略視角

**Japan SaaS Industry Deep Dive — Business Strategy**

> ⚠ **這是 Mock 模式展示資料**，基於真實研究資料重新整理，展示「商業策略」目的的 14 模組分析架構。請輸入 API Key 以使用 Claude 生成真實研究報告。

| 市場規模（2024） | 成長率 CAGR | AI 導入企業比例 | IT 人才缺口（2030） |
|---|---|---|---|
| ¥1.4 兆日圓 | ~25% | 57.7% | 79 萬人 |

---

## 0. 產業定義 Industry Definition

### 日本 SaaS 是什麼？包含什麼？

日本 SaaS 產業涵蓋透過訂閱制雲端交付給企業用戶的軟體服務。**核心特徵**是「深度嵌入日常業務流程」，而非美國式的水平功能工具。

| 維度 | 包含 | 不包含 |
|---|---|---|
| 交付模式 | 雲端訂閱制（SaaS）、API 服務 | On-premise、買斷式軟體、客製 SI 專案 |
| 功能範疇 | ERP、HR、會計、CRM、建設管理等業務流程工具 | 純基礎設施（IaaS/PaaS）、硬體系統 |
| 客戶群 | 日本法人企業（SMB 至大型企業） | 純 B2C 消費者軟體 |
| 業務模式 | 月費、年訂閱、Per-Seat 計費 | 一次性軟體授權、BPO 服務 |
| AI 層 | SaaS 內嵌 AI 功能、AI Agent 後台 | 純獨立 LLM API、無 SaaS 核心的 AI 工具 |

### 日本 SaaS 的本質特徵

- **業務流程對位（非工具對位）**：產品常與 SI 專案、顧問服務、BPO 綁在一起，形成難以拆分的生態系
- **垂直深度優先**：相較美國水平 SaaS，日本更偏好垂直整合與業界流程對應
- **法規合規內建**：會計、稅務、建設管理、醫療等嚴格法規要求，SaaS 需提供完整 Audit Trail
- **SIer 依存**：中間商（SIer）深度介入，系統導入幾乎都需 SI 夥伴協助

### 產業本質一句話

> **日本 SaaS 是 AI 正在補足還沒數位化的企業人力流程——法規合規 × Domain Data × SIer 整合三重護城河，讓深度垂直 SaaS 成為難以被取代的產業基礎設施。**

---

## 1. 決策摘要 Executive Summary

### 核心結論

- **好產業嗎？** → **是**。日本 SaaS 市場 2024 年 ¥1.4 兆，2028 年破 ¥2 兆，CAGR ~25%，仍在滾動擴張期，非飽和市場。
- **誰最強？** → 深度嵌入法規流程的 Back-office SaaS（freee、Money Forward、SmartHR）護城河最深；垂直 SaaS（ANDPAD、M3）Domain Data 優勢強。
- **最大機會？** → 中小企業 SaaS 採用率僅 34%，AI Add-on 帶動 ARPU 提升，7–10 年複利成長空間。
- **最大風險？** → 無差異化水平 SaaS 面臨 AI 商品化；2026-2028 年 AI Agent 普及後 Seat 壓縮可能出現（但日本人力缺口延後且降低此風險）。
- **AI 的角色？** → AI 在日本不是 SaaS 殺手，而是 SaaS 加速器——79 萬 IT 人力缺口讓 AI 成為企業存活工具而非裁員手段。

### 10 大策略重點

1. 人口老化 × AI = 最強結構性驅動力，79 萬 IT 人才缺口使 AI 成為必需品
2. 多數企業仍在 DX 進行中，SaaS 仍有 7-10 年結構性成長空間
3. AI 第一波替代對象是「人工流程」（Excel/紙本/電話），SaaS 座位不是立即風險
4. 法規驅動的 Back-office SaaS 是最安全的護城河，電子發票制度等持續推動採用
5. 垂直 SaaS 的 Domain Data 護城河因 AI 而加深，非加速消亡
6. SIer 通路和大型 IT 廠商（NTT/Fujitsu）是觸及中大型企業的必要路徑
7. 定價模式將從 Seat-based 逐步走向 Hybrid（Seat + AI Add-on Usage）
8. MCP 介面開放 → AI Backend 地位確立是 2025-2026 年的新競爭門檻
9. AI-native 競爭者來自外部的速度比美國慢，「防禦式創新」模式成主導
10. VC 聚焦：垂直 SaaS+AI、Back-office AI Platform、AI Agent Platform 為主流

---

## 2. 市場結構 Market Structure

### 市場規模與成長

| 指標 | 數值 | 備註 |
|---|---|---|
| TAM（2024） | ¥1.4 兆日圓 | 約 90 億美元 |
| TAM（2028 預估） | ¥2 兆日圓+ | 成長約 1.5 倍 |
| 頭部廠商 5 年 CAGR | 25%+ | Rakus、Sansan、MF、freee 等 |
| 中小企業 SaaS 採用率 | ~34% | 仍廣大未開發空間 |
| 大企業 SaaS 導入率 | 74.1% | 但 60.7% 認為「未充分活用」 |
| 雲端整體導入率 | 80.6% | 含 IaaS/PaaS/SaaS，部分部門採用 |
| 企業 AI 導入比例 | 57.7% | NRI 2025 調查 |

### 集中度分析

日本 SaaS 市場呈「分層結構」：頭部廠商（freee、Money Forward、SmartHR、Sansan、ANDPAD 等）已建立超過百億日圓 ARR 的規模，資本市場對其視為成熟商業模式；長尾市場由大量中小垂直 SaaS 和 SIer 定製方案組成，集中度低。

### Pricing Power 與 Switching Cost

- **高 Switching Cost**：Back-office SaaS（會計、HR、ERP）因資料遷移複雜度高、法規責任連帶，客戶極少離開
- **中等 Pricing Power**：頭部垂直 SaaS 可逐步提升 ARPU（透過 AI Add-on 實現 Upsell）
- **低 Switching Cost 警示**：通用低功能工具、輕量 FAQ bot 等競爭差異化低，定價競爭激烈

### Fact → Analysis → Judgment → So What

**Fact**：SMB 採用率 34%，大企業 74.1% 已導入但活用不足。

**Analysis**：日本 SaaS 市場同時存在「量的滲透機會（SMB）」和「質的深化機會（大企業活用升級）」兩條成長路徑，且受 AI 驅動的法規電子化持續提供強制性需求。

**Judgment**：**Attractive** — 高 Switching Cost Back-office SaaS + 低滲透率 + 法規推動 = 少見的「確定性成長市場」，比美國 SaaS 在 AI 衝擊前更安全。

**So What**：定位策略應聚焦「高 Switching Cost 垂直市場」+「法規合規能力」，避免進入無差異化水平市場。

---

## 3. 產業價值鏈 Industry Value Chain

### 各環節分析

| 層級 | 主要角色 | 功能 | Profit Pool 評估 |
|---|---|---|---|
| 上游 | 雲端基礎設施（AWS、Azure、GCP） | 算力、儲存、資料庫 | ★★★ 穩定，但競爭壓縮成本 |
| 中游（核心） | SaaS 廠商（freee、MF、SmartHR、ANDPAD） | 業務流程軟體、資料平台、AI 嵌入 | **★★★★★ 最大 Profit Pool** |
| 中游（通路） | SIer（NTT Data、Fujitsu、NEC）、地方 SI | 系統導入、客製化、維護支援 | ★★★★ 高利潤但競爭加劇 |
| 下游（服務） | 會計師、社勞士、BPO 服務商 | 會計代行、人事外包、顧問 | ★★ 正被 AI 蠶食的環節 |
| 終端用戶 | 日本企業（SMB 至大型企業） | 付費客戶、資料提供者 | 付費接受者 |

### 核心判斷：哪個環節 Profit Pool 最大？

- **SaaS 中游廠商**：掌握核心交易資料，AI 讓其從工具升級為「AI 的資料層與執行後台」，Profit Pool 持續擴大
- **SIer 通路**：短期仍享高利潤，但長期面臨 AI 顧問服務（AX Consulting）取代部分 SI 工作的壓力
- **下游 BPO / 人工流程**：AI 替代速度最快，這個環節被 AI 蠶食的價值，大部分流向 SaaS 中游

> **關鍵洞察**：AI 讓日本 SaaS 中游廠商成為「AI 的資料層與執行後台」——作為 AI Backend 的 SaaS 比人工替代的 SaaS 更難被取代。

---

## 4. 產業經濟性 Industry Economics

### 頭部日本 SaaS 財務特徵

| 指標 | 日本 SaaS 特徵 | 說明 |
|---|---|---|
| 毛利率 | 60-75% | 軟體高毛利；含 SI 服務混合後偏低 |
| 營益率 | 成長期普遍較低或虧損 | 仍在規模化投入期，S&M + R&D 比率高 |
| ARR 成長率 | 頭部廠商 25%+ CAGR | Rakus、Sansan、MF、freee 均在此範圍 |
| NRR | 100-120%+（估） | Back-office SaaS 黏著度高，整合收入強 |
| ROIC | 投資回報長期導向 | SI 通路建設成本高，SMB 長期訂閱穩 |
| FCF | 成長期 FCF 為負 | 高 CAC 換取長期穩定 ARR |
| CapEx | 低（雲端運算外包） | 主要投入在 R&D 與 S&M |
| Working Capital | 年費預收有利 WC | 年訂閱預收款改善現金流 |

> **投資含義**：日本 SaaS 的高黏著度（Back-office 法規綁定）+ 低滲透率（34% SMB 採用）= 長期 ARR 複利成長的結構性基礎。頭部廠商 25% CAGR 是「穩定複利」而非一次性爆發。

---

## 5. 主要玩家 Key Players

| 分類 | 公司 | 核心領域 | AI 策略 | 護城河 |
|---|---|---|---|---|
| Leaders | freee | 中小企業會計/經營管理 | AI Agent（Beta）嵌入多產品；跨產品業務日常化 | 稅務法規 + 財務資料整合 |
| Leaders | Money Forward | 財務 SaaS + AI Agent Platform | AI Vision 2025：AI Agent + AX Consulting | 企業財務資料網絡 + 顧問生態 |
| Leaders | SmartHR | 人事勞務 SaaS | AI 助理 + HR FAQ；AI 員工相似度分析 | 勞務法規 + 人事資料 |
| Leaders | Sansan | 名片/B2B 人脈管理 | 名片 → B2B Intelligence Platform；商機預測 | B2B Contact Graph + 關係 AI |
| Challengers | ANDPAD | 建設現場管理 | Stellarc：AI 自動生成日報、預測工程延誤 | 建設 Domain Data + 現場工作流 |
| Challengers | M3 | 醫療情報/MR 平台 | AI 個人化醫師資訊推播；RWE 平台 | 醫師 Coverage + 醫療行為資料 |
| Challengers | Cybozu/kintone | 低程式碼業務平台 | RAG 技術跨 App 自然語言問答 | 業務平台資料 Hub + 生態系 |
| Disruptors | AI-native 新創 | 特定流程自動化 | AI-first 產品設計 | 速度 + 靈活性（但法規護城河薄） |
| Commodity | SIer 自建工具 | 客製化企業內部工具 | 搭載大廠 LLM（NTT/Fujitsu） | 現有客戶關係 + 導入服務 |

---

## 6. 競爭結構 Competitive Dynamics

### 競爭維度分析

| 競爭維度 | 現況分析 | 趨勢 |
|---|---|---|
| 技術 | AI 嵌入成為標配，RAG、Agent、MCP 介面是新分水嶺 | AI 功能差距快速縮小，Data Moat 更重要 |
| 定價 | 以 Seat-based 為主，AI Add-on 開始試水 | 走向 Hybrid Usage + Outcome-based 演進 |
| 通路 | SIer 主導中大型客戶，會計師管道滲透 SMB | AI 顧問服務（AX Consulting）成為新通路 |
| 生態系 | kintone App Market、freee 連結夥伴生態 | MCP 介面生態：誰的 backend 被更多 AI 調用 |
| 規模 | 規模效應在法規更新和 SIer 通路覆蓋成本分攤 | AI 訓練資料規模效應成為新競爭維度 |
| 法規 | 電子發票等法規適應快慢成競爭差距 | AI 責任法規、Data Residency 要求強化 |

### 競爭核心洞察

> **日本 SaaS 的競爭不是在拼「技術功能」，而是「誰掌握核心交易資料 + 法規合規責任 + SIer 通路」**。這三個要素決定長期護城河深度。

### 防禦式創新模式

日本 SaaS 廠商面對 AI 衝擊採「防禦式創新」策略，不是創造 AI-native 替代品，而是把 AI 吸收進自己的產品線，強化現有護城河。這與美國出現大量外部 AI-native SaaS 撼動者的情況截然不同。

---

## 7. 關鍵成功因素 Key Success Factors

| 成功因素 | 重要性 | 說明 | 代表案例 |
|---|---|---|---|
| 法規合規能力 | ★★★★★ | 稅務/勞務/建設法規深度整合，提供完整 Audit Trail，企業不敢自行更換 | freee、SmartHR |
| Domain Data 積累 | ★★★★★ | 核心交易資料成為 AI 訓練與執行後台，越多資料越難被替代 | M3 醫療資料、ANDPAD 建設記錄 |
| SIer 通路夥伴 | ★★★★ | 中大型企業採購幾乎都透過 SIer，通路覆蓋廣度是重要差異點 | Money Forward、kintone |
| AI Agent 整合能力 | ★★★★ | 提供 MCP 介面讓 AI 可以調用自身 backend，成為 AI Operational Platform | freee、MF（2025-2026 趨勢） |
| 品牌與信任 | ★★★★ | 日本企業對廠商社會信任極度重視，品牌信任是無法快速複製的護城河 | 所有頭部廠商 |
| 資本效率 | ★★★ | 日本 SMB 獲客週期長，能有效控制 CAC 的廠商競爭優勢明顯 | Sansan、SmartHR |
| 法規更新反應速度 | ★★★ | 電子發票等法規更新，快速響應者能吸引因法規強制數位化的新客戶 | freee 快速應對法規更新 |

---

## 8. 長期趨勢 Secular Trends

### 日本 SaaS 的五大結構性趨勢

- **AI**：AI Agent 嵌入 SaaS，從工作流工具升級為 Operational Platform；勞動力短缺讓 AI 成為必需品而非選項
- **Cloud**：雲端化仍在推進，大企業導入率 80.6% 但「活用」仍不足；AI 加速雲端深化
- **Automation**：文件自動化（OCR、自動輸入）、流程自動化（AI 議事錄、審批 Agent）快速落地
- **Demographics（人口結構）**：高齡化與勞動力短缺是最強驅動力，2030 年 IT 人才缺口 79 萬人
- **Geopolitics**：日本推動 AI / 半導體 10 年兆元投資；Data Residency 要求強化，本地 SaaS 廠商獲益

> **最強結構性趨勢**：Demographics × AI 的乘數效應。人口減少 → 勞動力短缺 → 企業無法靠人力補足 → AI 成為企業存活工具 → 深度整合 AI 的 SaaS 獲得最高估值溢價。這是全球最獨特的「AI 必需品化」條件。

### 日本 DX 現狀時間軸

| DX 推進程度等級 | 比例 | 描述 |
|---|---|---|
| Level 3+（全社策略 + 資料驅動） | 約 12.4% | 真正完成數位轉型，已建立 AI 快速部署基礎 |
| Level 2（部分部門數位化） | 約 22.6% | 前端工具導入，但流程整合未完整 |
| Level 1 以下（零散導入） | 約 65%+ | 仍依賴紙本/舊系統/Excel，SaaS 仍有巨大滲透空間 |

---

## 9. 成長動能 Growth Drivers

### 成長動能分解

| 成長維度 | 具體驅動因素 | 關鍵指標 |
|---|---|---|
| Volume（量） | 中小企業 SaaS 採用率 34% → 70%+；首次導入 SaaS 的大量企業 | SMB 採用率 34% → 市場 2× 空間 |
| ASP（客單價） | AI Add-on（Agent 功能、Consulting 服務）提升 ARPU；Usage-based 計費轉型 | AI Agent 模組 Premium 定價 |
| Penetration（滲透） | 法規驅動（電子發票制度、電子帳簿保存法強制企業 SaaS 化） | 法規強制中小企業採用會計 SaaS |
| Geographic Expansion | 日本國內地方中小企業仍大量未被 SaaS 觸及；東南亞進入機會 | 地方 SMB、東南亞進入 |
| Product Mix | 從單一產品 → 平台化（Platform of Record），Cross-sell 多模組 | freee 從會計擴展至 HR、融資 |

### AI 驅動的新成長邏輯

AI 為日本 SaaS 帶來不只一條新成長曲線：

- **勞動力替代消費**：以「AI 替代的人力節省費用」計費，客戶願意付更多（Money Forward 費用申請 AI Agent 模式）
- **AX Consulting 收入**：幫助企業導入 AI Transformation，高毛利顧問服務 + SaaS 訂閱複合收費
- **AI Platform 費用**：成為 AI Agent 的執行後台，API 調用次數、Agent 執行次數計費

---

## 10. 風險與顛覆 Risks & Disruption

| 風險類型 | 風險內容 | 嚴重程度 | 緩解因素 |
|---|---|---|---|
| 需求 | 景氣衰退壓縮 SaaS 支出，企業預算削減 | 中 | Back-office 是必要支出，難以削減 |
| 供給 | IT 人才短缺導致 SaaS 廠商 R&D 放緩 | 中高 | AI 輔助開發可部分緩解 |
| 定價 | AI 工具壓縮輕量 SaaS 的定價空間 | 高（輕量 SaaS） | 垂直/法規 SaaS 定價相對穩定 |
| 技術（AI） | 通用 LLM 替代淺層 SaaS 功能，Seat 壓縮開始 | 中（目前）→ 高（2028+） | 法規責任、資料護城河難被 LLM 替代 |
| 中國競爭 | 低價中國 SaaS 進入日本市場 | 低（短期） | Data Residency 要求、信任壁壘 |
| 法規 | AI 責任法規可能提高合規成本 | 中 | 本地廠商更快速應對 |
| SIer 抵制 | SIer 推薦系統保護利益，阻礙 SaaS 替換 | 中（SMB 以外） | 勞動力短缺在迫使 SIer 也推 AI 方案 |
| AI 替代 SaaS 座位 | AI Agent 讓企業減少 SaaS License 用量，Seat 數下降 | 2026+ 需觀察 | 日本滲透率低，整體市場仍在成長 |

> **風險矩陣總結**：目前最大的風險是「無深度資料護城河的 Horizontal SaaS」被 AI 工具取代。法規可控的 Back-office SaaS 和垂直 SaaS 短期風險可控，但需在 2026-2028 年建立 AI Platform 地位以防禦長期風險。

---

## 11. 商業策略啟示 Strategic Implications

### 哪個環節值得關注

| 投資目標類型 | 吸引力 | 代表方向 | 主要風險 |
|---|---|---|---|
| 垂直 SaaS + AI（建設/醫療/製造） | ★★★★★ | ANDPAD、M3 類 | Domain 範疇受限，規模天花板 |
| Back-Office AI Platform（會計/HR） | ★★★★★ | freee、MF、SmartHR 類 | 法規更新能力、AI 執行力 |
| B2B 關係資料/Data Network SaaS | ★★★★ | Sansan 類 | AI CRM 競爭加劇 |
| AI Agent Platform / Infrastructure | ★★★★ | AX Consulting、MCP Infra | 市場早期，驗證路徑未明 |
| SIer + AI 轉型服務 | ★★★ | NTT、Fujitsu AI 事業 | 傳統組織轉型阻力 |
| 水平通用協作 SaaS | ★★ | Cybozu 等（若轉型） | 被 Office+Copilot 侵蝕 |
| 輕量單功能 SaaS | ★ | FAQ Bot、簡易 OCR | 極高被 AI 取代風險 |

### 哪裡有超額利潤

- **法規護城河 × AI 加乘**：每次法規變更強制客戶採用 SaaS，且 AI 整合使 ARPU 提升
- **Domain Data 積累先行者優勢**：垂直 SaaS 的 Domain Dataset 是 AI 時代的核心資產，先行者優勢顯著
- **AX Consulting 新收入線**：高毛利顧問服務 + SaaS 訂閱複合，Money Forward 模式可能成為行業標準

### 哪些商業模式危險

- Pure Seat-based + 無 AI 路線整合：2028 年後面臨定價壓縮
- 無 SIer 通路的純直銷中大型市場：觸及成本高，且不 SIer 夥伴的 SaaS 被自己顧問蠶食的風險
- 水平通用 Horizontal SaaS 無差異化：直接面對 Office+Copilot、Google Workspace+Gemini 替代

---

## 12. 關鍵追蹤指標 KPIs to Watch

| KPI | 追蹤目的 | 觀察方向 |
|---|---|---|
| NRR（Net Revenue Retention） | 客戶整合程度 + AI Upsell 成效 | 維持 100%+ 並隨 AI Add-on 成長 |
| AI Add-on 收入佔比 | 新定價模式的實際滲透進度 | 2025-2027 年快速成長為正向信號 |
| SMB 新客戶導入速度 | 滲透空間擴展是否持續（DX 擴張期確認） | 若 SMB 新客成長放緩，代表滲透期接近尾聲 |
| 企業 SaaS Seat 數變化 | AI 是否開始壓縮座位（SaaSpocalypse 早期訊號） | Seat 數開始下滑是警示訊號 |
| MCP 介面開放率（日本 SaaS） | SaaS 廠商 AI Backend 地位建立速度 | 快速開放代表 SaaS 轉型能力強 |
| 日本 AI Agent 市場規模（年度） | AI 是否真正大規模替代人工流程 | 目標 2028 年 ¥8,880 億（CAGR 49.9%） |
| 企業 AI 導入率 | AI Adoption 廣度（目前 57.7%） | 邁向 80%+ 代表 AI 進入推廣標準化 |
| IT 人才缺口數字（年度更新） | 人力短缺驅動力是否持續加強 | 缺口越大，AI SaaS 需求越剛性 |
| SIer 主動推薦 SaaS + AI 比例 | 通路的 AI 轉型速度 | SIer 轉型是 AI SaaS 擴張的關鍵推手 |
| 法規新變更（稅務/勞務/AI 法） | 下一波強制採用觸發點 | 新法規 = 新一波 SaaS 強制採用機會 |

---

## 13. 支撐資料與來源 Supporting Facts & Sources

| Claim | 數值 | 來源 | 可靠度 |
|---|---|---|---|
| 日本 SaaS 市場規模 2024 | ¥1.4 兆日圓 | ULPA、Research Nester | 高（多源一致） |
| 2028 年預估規模 | ¥2 兆日圓+ | 複數分析機構預測 | 中高（前瞻估計） |
| 頭部廠商 5 年 CAGR | 25%+ | 上市公司財報 | 高（公開數據） |
| SMB SaaS 採用率 | ~34% | nihonium 調查 | 中（調查樣本範圍待確認） |
| IT 人才缺口（2030） | 79 萬人 | 経産省 / 総務省 | 高（官方數據） |
| 因缺工倒閉企業（2024） | 342 家（YoY +32%） | 帝国データバンク | 高（官方統計） |
| 企業 AI 導入率 | 57.7% | NRI IT 活用調查 2025 | 高（知名研究機構） |
| AI 導入主要障礙 | 「リテラシー不足」70.3% | NRI 2025 | 高 |
| 個人 vs 企業 AI 使用率差距 | 26.7% vs 55.2% | 総務省《情報通信白書》 | 高（政府數據） |
| 大企業 SaaS 導入率 | 74.1%（60.7% 未充分活用） | DX Magazine 調查 2024 | 中高 |
| 雲端整體導入率 | 80.6% | 総務省《情報通信》令和 7 年版 | 高（官方） |
| 日本 AI Agent 市場 2028 | ¥8,880 億（CAGR 49.9%） | Grand View Research | 中（預測模型） |
| DX 推進 Level 3+ 比例 | 約 12.4% | UCK Inc 分析 | 中（調查範圍） |

### 資料缺口與注意事項

- **缺口 1**：SMB SaaS 採用率 34% 的精確定義（哪種規模、哪類 SaaS）仍需核實初始調查
- **缺口 2**：日本 SaaS NRR 數據稀少，頭部廠商少數公開；需從財報季報追蹤
- **缺口 3**：AI Add-on 收入佔比目前幾乎無廠商公開揭露，是追蹤盲點
- **注意事項**：部分預測數據（如 2028 年 AI Agent 市場）為市場研究機構估算，前瞻誤差較大
- **注意事項**：日本 SaaS 頭部廠商定義及報告口徑不一，確認是否包含 SIer 定製方案

---

## 最終產業結論 Final Industry Conclusion

- **產業 Attractiveness：** Attractive — 高 Switching Cost Back-office SaaS + 低滲透率 + 法規推力 + AI 加速器效果
- **長期趨勢：** AI × 人口老化共同驅動 7–10 年結構性成長；市場向「法規負責 + AI Backend」型 SaaS 集中
- **最大機會：** 垂直 SaaS + AI（Domain Data × 法規合規）是最難被替代、超額利潤最高的商業模式
- **最大風險：** 無差異化 Horizontal SaaS 在 AI 商品化後定價空間快速收縮；2026-2028 年需建立 AI Platform 地位
- **未來 3–5 年最重要觀察點：** ① SMB 滲透率擴張速度是否持續；② AI Add-on 收入佔比是否快速提升；③ MCP 介面生態競爭誰主導 AI Backend 地位

---

*「日本 SaaS 不是在被 AI 消滅，而是在被 AI 重新定義——誰先成為 AI Agent 的後台，誰就贏得下一個十年。」*
`,
};

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
