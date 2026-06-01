'use client'

import { useState } from "react";
import FocusAreaSelector from "./FocusAreaSelector";
import SpecialFrameworkSelector from "./SpecialFrameworkSelector";
import type {
  UserResearchInput,
  Geography,
  AnalysisPurpose,
  TimeHorizon,
  OutputDepth,
  FocusArea,
  SpecialIndustryFramework,
} from "@/types/research";
import { GEOGRAPHY_LABELS, getPurposeFocusDefaults } from "@/types/research";

const PURPOSE_DISPLAY_LABEL: Record<AnalysisPurpose, string> = {
  quick_understanding: "快速了解",
  investment: "投資研究",
  strategy: "商業策略",
  market_entry: "市場進入",
  startup: "創業 / 新創",
  bd_supply_chain: "供應鏈 / BD",
  client_presentation: "客戶簡報",
  academic_research: "論文 / 研究",
  other: "其他",
};

const DEFAULT_PURPOSE: AnalysisPurpose = "strategy";
const { selected: defaultSelected, depths: defaultDepths } = getPurposeFocusDefaults(DEFAULT_PURPOSE);

const INITIAL_INPUT: UserResearchInput = {
  industryName: "",
  geographies: ["global"],
  geographyOther: "",
  analysisPurpose: DEFAULT_PURPOSE,
  analysisPurposeOther: "",
  timeHorizon: "long_3_10y",
  outputDepth: "standard_12_15_pages",
  language: "traditional_chinese",
  selectedFocusAreas: defaultSelected,
  focusAreaDepths: defaultDepths,
  specialIndustryFramework: "auto_detect",
  customFocus: "",
};

// ── Shared UI primitives ──────────────────────────────────────────────────────

function Section({
  title,
  helper,
  children,
  defaultOpen = true,
}: {
  title: string;
  helper?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="bg-white border border-gray-200 rounded-xl p-5" open={defaultOpen}>
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h2>
            {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
          </div>
          <span className="text-xs text-gray-400 mt-0.5 shrink-0">展開 / 收合</span>
        </div>
      </summary>
      <div className="mt-5 space-y-6">{children}</div>
    </details>
  );
}

function Question({
  label,
  helper,
  required,
  error,
  children,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2">
        <label className="text-sm font-medium text-gray-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {helper && <p className="text-xs text-gray-500 mt-0.5">{helper}</p>}
      </div>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const GEO_OPTIONS: Array<{ label: string; value: Geography }> = [
  { label: "全球", value: "global" },
  { label: "美國", value: "us" },
  { label: "中國", value: "china" },
  { label: "歐洲", value: "europe" },
  { label: "日本", value: "japan" },
  { label: "台灣", value: "taiwan" },
  { label: "東南亞", value: "southeast_asia" },
  { label: "其他", value: "other" },
];

function GeographyMultiSelect({
  values,
  onChange,
}: {
  values: Geography[];
  onChange: (v: Geography[]) => void;
}) {
  const toggle = (v: Geography) => {
    if (v === "global") {
      onChange(values.includes("global") ? [] : ["global"]);
      return;
    }

    if (values.includes(v)) {
      onChange(values.filter((g) => g !== v));
    } else {
      onChange([...values.filter((g) => g !== "global"), v]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {GEO_OPTIONS.map((opt) => {
        const isSelected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              isSelected
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function PurposeCards({
  value,
  onChange,
}: {
  value: AnalysisPurpose;
  onChange: (v: AnalysisPurpose) => void;
}) {
  const options: Array<{
    value: AnalysisPurpose;
    title: string;
    description: string;
    tags: string;
  }> = [
    {
      value: "investment",
      title: "投資研究",
      description: "Investment Research",
      tags: "growth · moat · pricing power · valuation · downside risk",
    },
    {
      value: "strategy",
      title: "商業策略",
      description: "Business Strategy",
      tags: "market structure · positioning · GTM · capability gap",
    },
    {
      value: "market_entry",
      title: "市場進入",
      description: "Market Entry",
      tags: "addressable market · entry mode · barriers · first mover",
    },
    {
      value: "startup",
      title: "創業 / 新創",
      description: "Startup / Venture",
      tags: "disruption · unmet needs · wedge · incumbents weakness",
    },
    {
      value: "bd_supply_chain",
      title: "供應鏈 / BD",
      description: "BD / Supply Chain",
      tags: "ecosystem · vendors · buyers · procurement · partnership",
    },
    {
      value: "quick_understanding",
      title: "快速了解",
      description: "Quick Overview",
      tags: "big picture · key players · basic structure",
    },
    {
      value: "client_presentation",
      title: "客戶簡報",
      description: "Client Presentation",
      tags: "executive summary · insights · recommendations",
    },
    {
      value: "academic_research",
      title: "論文 / 研究",
      description: "Academic Research",
      tags: "literature · data · methodology · citations",
    },
    {
      value: "other",
      title: "其他",
      description: "Other",
      tags: "自行描述",
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`text-left rounded-xl border p-3.5 transition ${
              isSelected
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            <span className="block text-sm font-semibold">{opt.title}</span>
            <span className={`block text-xs mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
              {opt.description}
            </span>
            <span className={`block text-xs mt-2 font-mono ${isSelected ? "text-gray-400" : "text-gray-400"}`}>
              {opt.tags}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface Props {
  apiKey: string;
  mockMode: boolean;
  onApiKeyChange: (key: string) => void;
  onMockModeChange: (mock: boolean) => void;
  onSubmit: (input: UserResearchInput) => void;
}

export default function ResearchInputForm({
  apiKey,
  mockMode,
  onApiKeyChange,
  onMockModeChange,
  onSubmit,
}: Props) {
  const [input, setInput] = useState<UserResearchInput>(INITIAL_INPUT);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<UserResearchInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
    setErrors({});
  };

  const handlePurposeChange = (purpose: AnalysisPurpose) => {
    const { selected, depths } = getPurposeFocusDefaults(purpose);
    update({ analysisPurpose: purpose, selectedFocusAreas: selected, focusAreaDepths: depths });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!input.industryName.trim()) errs.industryName = "請輸入產業名稱";
    if (input.geographies.length === 0) errs.geographies = "請至少選擇一個地理範圍";
    if (input.geographies.includes("other") && !input.geographyOther?.trim()) {
      errs.geographyOther = "請輸入地理範圍";
    }
    if (input.selectedFocusAreas.length === 0) errs.focusAreas = "請至少勾選一個分析重點";
    if (input.analysisPurpose === "other" && !input.analysisPurposeOther?.trim()) {
      errs.analysisPurposeOther = "請描述分析目的";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(input);
  };

  const purposeLabel = PURPOSE_DISPLAY_LABEL[input.analysisPurpose];

  const geoLabel = input.geographies.length > 0
    ? input.geographies.map((g) =>
        g === "other" && input.geographyOther ? input.geographyOther : GEOGRAPHY_LABELS[g]
      ).join("、")
    : "尚未選擇";

  return (
    <div className="space-y-5">
      {/* API Key + Mock Mode panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-800">API 設定</p>
            <p className="text-xs text-gray-500 mt-0.5">輸入 Anthropic API Key，或開啟 Mock 模式體驗完整流程</p>
          </div>
          <button
            type="button"
            onClick={() => onMockModeChange(!mockMode)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              mockMode
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            <span
              className={`w-8 h-4 rounded-full transition-colors flex items-center ${
                mockMode ? "bg-amber-400" : "bg-gray-200"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full bg-white shadow transition-transform mx-0.5 ${
                  mockMode ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </span>
            Mock 模式{mockMode ? "（已開啟）" : ""}
          </button>
        </div>

        {mockMode ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            Mock 模式已開啟：系統將使用預設 AI 伺服器產業的示範資料，讓你體驗完整流程，不會消耗 API 用量。
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Anthropic API Key
              <span className="ml-1 font-normal text-gray-400">（輸入後僅在本次 session 使用，不會儲存）</span>
            </label>
            <input
              type="password"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition ${
                apiKey
                  ? "border-emerald-300 bg-emerald-50/30"
                  : "border-gray-200 bg-white"
              }`}
              placeholder="sk-ant-api03-..."
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              autoComplete="off"
            />
            {apiKey && (
              <p className="text-xs text-emerald-600 mt-1">✓ API Key 已設定</p>
            )}
            {!apiKey && (
              <p className="text-xs text-gray-400 mt-1">
                沒有 API Key？請至{" "}
                <span className="text-gray-600 font-medium">console.anthropic.com</span>{" "}
                取得，或改用 Mock 模式體驗流程。
              </p>
            )}
          </div>
        )}
      </div>

      {/* Hero */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Step 1</p>
        <h2 className="text-xl font-bold text-gray-900">建立產業研究任務</h2>
        <p className="text-sm text-gray-500 mt-1">
          設定研究需求 → Claude 產生研究架構 → 確認架構後生成完整 Markdown 報告
        </p>
      </div>

      {/* Core input */}
      <Section title="基本資訊" helper="定義這次要分析的產業與研究目的">
        <Question label="你想分析的產業是什麼？" required error={errors.industryName}>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
            placeholder="例如：日本 PE 產業、AI 伺服器產業、台灣高爾夫球頭製造業、企業 SaaS 產業"
            value={input.industryName}
            onChange={(e) => update({ industryName: e.target.value })}
          />
        </Question>

        <Question label="地理範圍" helper="可複選多個地區；選擇全球時不可同時選其他地區" error={errors.geographies}>
          <GeographyMultiSelect
            values={input.geographies}
            onChange={(v) => update({ geographies: v })}
          />
          {input.geographies.includes("other") && (
            <div className="mt-2">
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="請輸入地理範圍"
                value={input.geographyOther ?? ""}
                onChange={(e) => update({ geographyOther: e.target.value })}
              />
              {errors.geographyOther && (
                <p className="text-xs text-red-600 mt-1">{errors.geographyOther}</p>
              )}
            </div>
          )}
          {input.geographies.length > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">已選：{geoLabel}</p>
          )}
        </Question>

        <Question label="分析目的" helper="選擇後系統自動推薦分析重點與搜尋深度">
          <PurposeCards value={input.analysisPurpose} onChange={handlePurposeChange} />
          {input.analysisPurpose === "other" && (
            <div className="mt-3">
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="請描述你的分析目的"
                value={input.analysisPurposeOther ?? ""}
                onChange={(e) => update({ analysisPurposeOther: e.target.value })}
              />
              {errors.analysisPurposeOther && (
                <p className="text-xs text-red-600 mt-1">{errors.analysisPurposeOther}</p>
              )}
            </div>
          )}
        </Question>

        <div className="grid gap-5 sm:grid-cols-3">
          <Question label="時間尺度">
            <div className="space-y-1.5">
              {([
                { label: "短期：6–12 個月", value: "short_6_12m" },
                { label: "中期：1–3 年", value: "medium_1_3y" },
                { label: "長期：3–10 年", value: "long_3_10y" },
                { label: "全部都看", value: "all" },
              ] as Array<{ label: string; value: TimeHorizon }>).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ timeHorizon: opt.value })}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                    input.timeHorizon === opt.value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Question>

          <Question label="輸出深度">
            <div className="space-y-1.5">
              {([
                { label: "快速版：8–10 頁", value: "quick_8_10_pages" },
                { label: "標準版：12–15 頁", value: "standard_12_15_pages" },
                { label: "深度版：15–18 頁", value: "deep_15_18_pages" },
              ] as Array<{ label: string; value: OutputDepth }>).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ outputDepth: opt.value })}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                    input.outputDepth === opt.value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Question>

          <Question label="輸出語言">
            <div className="space-y-1.5">
              {([
                { label: "繁體中文", value: "traditional_chinese" },
                { label: "English", value: "english" },
                { label: "中英雙語", value: "bilingual" },
              ] as Array<{ label: string; value: UserResearchInput["language"] }>).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ language: opt.value })}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                    input.language === opt.value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Question>
        </div>
      </Section>

      {/* Focus areas */}
      <Section
        title="產業分析重點"
        helper="系統根據分析目的自動推薦勾選狀態與搜尋深度，可手動調整"
      >
        {errors.focusAreas && (
          <p className="text-xs text-red-600">{errors.focusAreas}</p>
        )}
        <FocusAreaSelector
          selected={input.selectedFocusAreas as FocusArea[]}
          onChange={(selected) => update({ selectedFocusAreas: selected })}
          depths={input.focusAreaDepths}
          purposeLabel={purposeLabel}
        />
      </Section>

      {/* Special framework */}
      <Section
        title="特殊產業類型加強"
        helper="是否要針對特定產業類型加強分析？預設 Auto-detect。"
        defaultOpen={false}
      >
        <SpecialFrameworkSelector
          value={input.specialIndustryFramework as SpecialIndustryFramework}
          onChange={(v) => update({ specialIndustryFramework: v })}
        />
      </Section>

      {/* Custom focus */}
      <Section title="自訂研究重點" defaultOpen={false}>
        <Question label="還有沒有你特別想看的問題？" helper="可選。Claude 會在架構中納入你的特殊問題。">
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            rows={3}
            placeholder="例如：我想知道這個產業哪裡最容易被 AI agent 取代、哪些台灣公司受惠最大、是否適合 PE 投資"
            value={input.customFocus ?? ""}
            onChange={(e) => update({ customFocus: e.target.value })}
          />
        </Question>
      </Section>

      {/* Submit */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-4 sm:relative sm:bg-transparent sm:px-0 sm:border-0 sm:pt-0">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            已勾選 {input.selectedFocusAreas.length} 個分析模組
            {!mockMode && !apiKey && (
              <span className="ml-2 text-amber-600">· 請先輸入 API Key 或開啟 Mock 模式</span>
            )}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!mockMode && !apiKey}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {mockMode ? "🎭 Mock 模式：產生示範架構" : "產生研究架構"}
          </button>
        </div>
        {Object.keys(errors).length > 0 && (
          <p className="text-xs text-red-600 mt-2 sm:text-right">請先補齊必填欄位。</p>
        )}
      </div>
    </div>
  );
}
