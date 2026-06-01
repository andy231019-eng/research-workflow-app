'use client'

import { useState } from "react";
import type { Geography } from "@/types/research";
import { GEOGRAPHY_LABELS } from "@/types/research";

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

interface Props {
  apiKey: string;
  mockMode: boolean;
  onApiKeyChange: (key: string) => void;
  onMockModeChange: (mock: boolean) => void;
  onSubmit: (industryName: string, geographies: Geography[], geographyOther?: string) => void;
}

export default function IndustryStep({
  apiKey,
  mockMode,
  onApiKeyChange,
  onMockModeChange,
  onSubmit,
}: Props) {
  const [industryName, setIndustryName] = useState("");
  const [geographies, setGeographies] = useState<Geography[]>(["global"]);
  const [geographyOther, setGeographyOther] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleGeo = (v: Geography) => {
    if (v === "global") {
      setGeographies(geographies.includes("global") ? [] : ["global"]);
      return;
    }
    if (geographies.includes(v)) {
      setGeographies(geographies.filter((g) => g !== v));
    } else {
      setGeographies([...geographies.filter((g) => g !== "global"), v]);
    }
  };

  const geoLabel = geographies.length > 0
    ? geographies.map((g) =>
        g === "other" && geographyOther ? geographyOther : GEOGRAPHY_LABELS[g]
      ).join("、")
    : "尚未選擇";

  const handleSubmit = () => {
    const errs: Record<string, string> = {};
    if (!industryName.trim()) errs.industryName = "請輸入產業名稱";
    if (geographies.length === 0) errs.geographies = "請至少選擇一個地理範圍";
    if (geographies.includes("other") && !geographyOther.trim()) {
      errs.geographyOther = "請輸入地理範圍";
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit(industryName.trim(), geographies, geographyOther || undefined);
  };

  return (
    <div className="space-y-5">
      {/* API Settings */}
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
            Mock 模式已開啟：系統將使用示範資料，讓你體驗完整流程，不會消耗 API 用量。
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
                apiKey ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200 bg-white"
              }`}
              placeholder="sk-ant-api03-..."
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              autoComplete="off"
            />
            {apiKey ? (
              <p className="text-xs text-emerald-600 mt-1">✓ API Key 已設定</p>
            ) : (
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
        <h2 className="text-xl font-bold text-gray-900">你想研究哪個產業？</h2>
        <p className="text-sm text-gray-500 mt-1">
          輸入產業名稱後，Claude 會分析該產業的子分類，讓你精確定義研究範圍。
        </p>
      </div>

      {/* Industry + Geo */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">
            你想分析的產業是什麼？<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 ${
              errors.industryName ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="例如：日本 SaaS 產業、AI 伺服器產業、台灣高爾夫球頭製造業"
            value={industryName}
            onChange={(e) => {
              setIndustryName(e.target.value);
              setErrors((prev) => ({ ...prev, industryName: "" }));
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {errors.industryName && (
            <p className="text-xs text-red-600 mt-1">{errors.industryName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">地理範圍</label>
          <p className="text-xs text-gray-500 mb-2">可複選多個地區；選擇全球時不可同時選其他地區</p>
          <div className="flex flex-wrap gap-2">
            {GEO_OPTIONS.map((opt) => {
              const isSelected = geographies.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleGeo(opt.value)}
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
          {errors.geographies && (
            <p className="text-xs text-red-600 mt-1">{errors.geographies}</p>
          )}
          {geographies.includes("other") && (
            <div className="mt-2">
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="請輸入地理範圍"
                value={geographyOther}
                onChange={(e) => setGeographyOther(e.target.value)}
              />
              {errors.geographyOther && (
                <p className="text-xs text-red-600 mt-1">{errors.geographyOther}</p>
              )}
            </div>
          )}
          {geographies.length > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">已選：{geoLabel}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-4 sm:relative sm:bg-transparent sm:px-0 sm:border-0 sm:pt-0">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          {!mockMode && !apiKey && (
            <p className="text-xs text-amber-600">請先輸入 API Key 或開啟 Mock 模式</p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!mockMode && !apiKey}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {mockMode ? "Mock：分析產業子分類" : "分析產業子分類"}
          </button>
        </div>
      </div>
    </div>
  );
}
