'use client'

import type { FocusArea, SearchDepth } from "@/types/research";
import { ALL_FOCUS_AREAS } from "@/types/research";

interface Props {
  selected: FocusArea[];
  onChange: (selected: FocusArea[]) => void;
  depths?: Partial<Record<FocusArea, SearchDepth>>;
  purposeLabel?: string;
}

const DEPTH_BADGE: Record<SearchDepth, { label: string; lightCn: string; darkCn: string }> = {
  deep: {
    label: "深入",
    lightCn: "bg-blue-100 text-blue-700",
    darkCn: "bg-blue-500/30 text-blue-200",
  },
  standard: {
    label: "標準",
    lightCn: "bg-gray-100 text-gray-500",
    darkCn: "bg-white/15 text-gray-300",
  },
  optional: {
    label: "可選",
    lightCn: "bg-gray-50 text-gray-400 border border-gray-200",
    darkCn: "bg-white/10 text-gray-400",
  },
};

export default function FocusAreaSelector({ selected, onChange, depths, purposeLabel }: Props) {
  const toggle = (id: FocusArea) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => onChange(ALL_FOCUS_AREAS.map((f) => f.id));
  const clearAll = () => onChange([]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500">
            已選 {selected.length} / {ALL_FOCUS_AREAS.length} 個模組
          </p>
          {purposeLabel && (
            <p className="text-xs text-blue-600">
              已根據「{purposeLabel}」自動推薦 · 可手動調整
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            全選
          </button>
          <span className="text-xs text-gray-300">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            全部取消
          </button>
        </div>
      </div>

      {depths && (
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>搜尋深度：</span>
          {(["deep", "standard", "optional"] as SearchDepth[]).map((d) => (
            <span key={d} className={`px-1.5 py-0.5 rounded text-xs font-medium ${DEPTH_BADGE[d].lightCn}`}>
              {DEPTH_BADGE[d].label}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {ALL_FOCUS_AREAS.map((area) => {
          const isSelected = selected.includes(area.id);
          const depth = depths?.[area.id];
          const badge = depth ? DEPTH_BADGE[depth] : null;

          return (
            <button
              key={area.id}
              type="button"
              onClick={() => toggle(area.id)}
              className={`relative text-left rounded-lg border p-3 transition ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              {badge && (
                <span
                  className={`absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded font-medium ${
                    isSelected ? badge.darkCn : badge.lightCn
                  }`}
                >
                  {badge.label}
                </span>
              )}

              <div className="flex items-start gap-2 pr-10">
                <div
                  className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                    isSelected ? "border-white bg-white" : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-gray-900" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="block text-sm font-medium">
                    {area.label}
                    <span className={`ml-1.5 text-xs font-normal ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                      {area.labelEn}
                    </span>
                  </span>
                  <span className={`block text-xs mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                    {area.description}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
