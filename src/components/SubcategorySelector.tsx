'use client'

import { useState } from "react";
import type { IndustrySubcategory } from "@/types/research";

interface Props {
  industryName: string;
  geoLabel: string;
  subcategories: IndustrySubcategory[];
  onSelect: (subcategory: IndustrySubcategory | null) => void;
}

export default function SubcategorySelector({
  industryName,
  geoLabel,
  subcategories,
  onSelect,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selected === "__all__") {
      onSelect(null);
      return;
    }
    const sub = subcategories.find((s) => s.id === selected);
    if (sub) onSelect(sub);
  };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Step 1 — 定義產業範圍</p>
        <h2 className="text-lg font-bold text-gray-900">選擇要深入研究的子分類</h2>
        <p className="text-sm text-gray-500 mt-1">
          Claude 已將「<span className="font-medium text-gray-700">{industryName}</span>」（{geoLabel}）拆解為以下子分類。
          選擇要聚焦的範圍，可以讓研究更精準。
        </p>
      </div>

      {/* Subcategory grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {subcategories.map((sub) => {
          const isSelected = selected === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelected(sub.id)}
              className={`text-left rounded-xl border p-4 transition ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-semibold leading-snug">{sub.name}</span>
                <span className={`text-xs shrink-0 mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                  {sub.nameEn}
                </span>
              </div>
              <p className={`text-xs leading-relaxed mb-3 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                {sub.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {sub.examples.map((ex) => (
                  <span
                    key={ex}
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? "border-gray-600 text-gray-300"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </button>
          );
        })}

        {/* Full industry option */}
        <button
          type="button"
          onClick={() => setSelected("__all__")}
          className={`text-left rounded-xl border p-4 transition sm:col-span-2 ${
            selected === "__all__"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-dashed border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selected === "__all__" ? "border-gray-400 bg-gray-700" : "border-gray-300"
            }`}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <path d="M7 1a6 6 0 100 12A6 6 0 007 1zM7 4v3l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold">涵蓋整體「{industryName}」</span>
              <p className={`text-xs mt-0.5 ${selected === "__all__" ? "text-gray-300" : "text-gray-400"}`}>
                不縮小範圍，直接針對整個產業進行分析
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Confirm button */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-4 sm:relative sm:bg-transparent sm:px-0 sm:border-0 sm:pt-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {selected
              ? selected === "__all__"
                ? `已選：整體「${industryName}」`
                : `已選：${subcategories.find((s) => s.id === selected)?.name ?? selected}`
              : "請選擇一個子分類或繼續研究整個產業"}
          </p>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            確認範圍，繼續設定
          </button>
        </div>
      </div>
    </div>
  );
}
