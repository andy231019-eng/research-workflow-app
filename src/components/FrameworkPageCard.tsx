'use client'

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Copy, ArrowUp, ArrowDown } from "lucide-react";
import type { FrameworkPage } from "@/types/research";

interface Props {
  page: FrameworkPage;
  index: number;
  total: number;
  onChange: (updated: FrameworkPage) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

const SECTION_BADGE_COLORS: Record<string, string> = {
  industry_definition: "bg-violet-50 text-violet-700 border-violet-100",
  executive_summary: "bg-amber-50 text-amber-700 border-amber-100",
  market_structure: "bg-blue-50 text-blue-700 border-blue-100",
  industry_value_chain: "bg-cyan-50 text-cyan-700 border-cyan-100",
  industry_economics: "bg-emerald-50 text-emerald-700 border-emerald-100",
  key_players: "bg-indigo-50 text-indigo-700 border-indigo-100",
  competitive_dynamics: "bg-orange-50 text-orange-700 border-orange-100",
  key_success_factors: "bg-teal-50 text-teal-700 border-teal-100",
  secular_trends: "bg-sky-50 text-sky-700 border-sky-100",
  growth_drivers: "bg-green-50 text-green-700 border-green-100",
  technology_innovation: "bg-purple-50 text-purple-700 border-purple-100",
  regulation_external_factors: "bg-red-50 text-red-700 border-red-100",
  risks_disruption: "bg-rose-50 text-rose-700 border-rose-100",
  industry_winners: "bg-yellow-50 text-yellow-700 border-yellow-100",
  market_expectations_vs_reality: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
  investment_strategic_implications: "bg-lime-50 text-lime-700 border-lime-100",
  kpis_to_watch: "bg-slate-50 text-slate-700 border-slate-100",
  supporting_facts_sources: "bg-gray-50 text-gray-700 border-gray-100",
};

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          + 新增
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-xs text-gray-400 w-4 shrink-0 text-right">{i + 1}.</span>
            <input
              className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-gray-300 hover:text-red-400 text-base leading-none px-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FrameworkPageCard({
  page,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const badgeClass =
    SECTION_BADGE_COLORS[page.id?.split("_")[0] ?? ""] ??
    "bg-gray-50 text-gray-600 border-gray-100";

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-400 w-6 text-center">
          {page.pageNumber}
        </span>
        <div className="flex-1 min-w-0">
          <input
            className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none placeholder-gray-400"
            value={page.pageTitle}
            placeholder="頁面標題"
            onChange={(e) => onChange({ ...page, pageTitle: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
            title="上移"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
            title="下移"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 text-gray-400 hover:text-gray-700"
            title="複製"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500"
            title="刪除"
          >
            <Trash2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-700"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Always-visible summary */}
      <div className="px-4 py-3 space-y-2">
        <textarea
          className="w-full border border-gray-200 rounded px-3 py-2 text-xs text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={2}
          placeholder="核心問題 (Core Question)"
          value={page.coreQuestion}
          onChange={(e) => onChange({ ...page, coreQuestion: e.target.value })}
        />
        <textarea
          className="w-full border border-gray-200 rounded px-3 py-2 text-xs text-gray-600 italic resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
          rows={2}
          placeholder="主要訊息假設 (Main Message Hypothesis)"
          value={page.mainMessageHypothesis}
          onChange={(e) => onChange({ ...page, mainMessageHypothesis: e.target.value })}
        />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ListEditor
              label="需要的數據 Required Data"
              items={page.requiredData}
              onChange={(items) => onChange({ ...page, requiredData: items })}
              placeholder="具體數據點"
            />
            <ListEditor
              label="需要的 Evidence"
              items={page.evidenceNeeded}
              onChange={(items) => onChange({ ...page, evidenceNeeded: items })}
              placeholder="需要什麼類型的證據"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ListEditor
              label="建議資料來源 Suggested Sources"
              items={page.suggestedSources}
              onChange={(items) => onChange({ ...page, suggestedSources: items })}
              placeholder="來源名稱"
            />
            <ListEditor
              label="必須回答 Must Answer"
              items={page.mustAnswer}
              onChange={(items) => onChange({ ...page, mustAnswer: items })}
              placeholder="必須回答的問題"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                分析角度 Analysis Angle
              </label>
              <textarea
                className="w-full border border-gray-200 rounded px-3 py-2 text-xs text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                rows={2}
                value={page.analysisAngle}
                onChange={(e) => onChange({ ...page, analysisAngle: e.target.value })}
                placeholder="分析這一頁的角度"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                建議視覺化 Suggested Visual
              </label>
              <textarea
                className="w-full border border-gray-200 rounded px-3 py-2 text-xs text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                rows={2}
                value={page.suggestedVisual}
                onChange={(e) => onChange({ ...page, suggestedVisual: e.target.value })}
                placeholder="建議圖表或表格"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
