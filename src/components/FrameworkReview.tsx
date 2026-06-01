'use client'

import { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import type { ResearchFramework, FrameworkPage, Player, FocusArea } from "@/types/research";
import { ALL_FOCUS_AREAS } from "@/types/research";

interface Props {
  framework: ResearchFramework;
  selectedFocusAreas: FocusArea[];
  onConfirm: () => void;
  onRegenerate: (feedback?: string) => void;
  onEnrichDetails?: () => void;
  isEnrichingDetails?: boolean;
  detailError?: string;
}

// ── Tag badge ─────────────────────────────────────────────────────────────────

function Tag({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${colorMap[color] ?? colorMap.gray}`}>
      {children}
    </span>
  );
}

// ── Collapsible section ───────────────────────────────────────────────────────

function Collapse({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {badge}
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ── Player row ────────────────────────────────────────────────────────────────

function PlayerRow({ player }: { player: Player }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{player.name}</span>
          {player.ticker && (
            <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              {player.ticker}
            </span>
          )}
          {player.geographyOrListing && (
            <span className="text-xs text-gray-400">{player.geographyOrListing}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{player.role}</p>
        <p className="text-xs text-gray-600 mt-0.5">{player.whyRelevant}</p>
      </div>
    </div>
  );
}

// ── Page card with inline comment ─────────────────────────────────────────────

function PageCard({
  page,
  comment,
  onCommentChange,
}: {
  page: FrameworkPage;
  comment: string;
  onCommentChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasComment = comment.trim().length > 0;
  const isDetailed = page.detailStatus === "detailed";
  const hasDetails =
    page.requiredData.length > 0 ||
    page.evidenceNeeded.length > 0 ||
    page.suggestedSources.length > 0 ||
    page.mustAnswer.length > 0 ||
    Boolean(page.analysisAngle);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition"
      >
        <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {page.pageNumber}
        </span>
        <span className="flex-1 text-sm font-semibold text-gray-900">{page.pageTitle}</span>
        <Tag color={isDetailed ? "emerald" : "gray"}>
          {isDetailed ? "已補細節" : "大綱"}
        </Tag>
        {hasComment && (
          <MessageSquare size={13} className="text-blue-500 shrink-0" />
        )}
        {open ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
      </button>

      {/* Always visible: core question + hypothesis */}
      <div className="px-4 pb-3 space-y-2 border-t border-gray-50">
        {page.coreQuestion && (
          <div className="flex gap-2 pt-3">
            <Tag color="blue">核心問題</Tag>
            <p className="text-xs text-gray-700 leading-relaxed">{page.coreQuestion}</p>
          </div>
        )}
        {page.mainMessageHypothesis && (
          <div className="flex gap-2">
            <Tag color="amber">假設</Tag>
            <p className="text-xs text-gray-600 italic leading-relaxed">{page.mainMessageHypothesis}</p>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4 bg-gray-50/50">
          {!hasDetails && (
            <div className="bg-white border border-dashed border-gray-200 rounded-lg px-3 py-3">
              <p className="text-xs text-gray-500">
                這一頁目前是輕量大綱。可先確認方向，也可以使用下方「補齊下一批細節」加入需要的數據、Evidence、建議來源與必答問題。
              </p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {page.requiredData.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">需要的數據</p>
                <ul className="space-y-1">
                  {page.requiredData.map((item, i) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                      <span className="text-gray-400 shrink-0">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {page.evidenceNeeded.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">需要的 Evidence</p>
                <ul className="space-y-1">
                  {page.evidenceNeeded.map((item, i) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                      <span className="text-gray-400 shrink-0">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {page.mustAnswer.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">必須回答</p>
                <ul className="space-y-1">
                  {page.mustAnswer.map((item, i) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                      <span className="text-emerald-500 shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {page.suggestedSources.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">建議來源</p>
                <ul className="space-y-1">
                  {page.suggestedSources.map((item, i) => (
                    <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                      <span className="text-gray-300 shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {(page.analysisAngle || page.suggestedVisual) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {page.analysisAngle && (
                <div className="bg-white rounded-lg border border-gray-100 px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-500 mb-1">分析角度</p>
                  <p className="text-xs text-gray-600">{page.analysisAngle}</p>
                </div>
              )}
              {page.suggestedVisual && (
                <div className="bg-white rounded-lg border border-gray-100 px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-500 mb-1">建議視覺化</p>
                  <p className="text-xs text-gray-600">{page.suggestedVisual}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comment area — always visible */}
      <div className="border-t border-gray-100 px-4 py-3">
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder={`對「${page.pageTitle}」的補充或修改意見...`}
          rows={2}
          className={`w-full text-xs border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition placeholder:text-gray-300 ${
            hasComment
              ? "border-blue-200 bg-blue-50/40 text-gray-700"
              : "border-gray-200 bg-gray-50/40 text-gray-700"
          }`}
        />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function FrameworkReview({
  framework,
  selectedFocusAreas,
  onConfirm,
  onRegenerate,
  onEnrichDetails,
  isEnrichingDetails = false,
  detailError = "",
}: Props) {
  const [pageComments, setPageComments] = useState<Record<string, string>>({});
  const [overallComment, setOverallComment] = useState("");

  const setPageComment = (id: string, value: string) =>
    setPageComments((prev) => ({ ...prev, [id]: value }));

  const totalComments = Object.values(pageComments).filter((c) => c.trim()).length
    + (overallComment.trim() ? 1 : 0);
  const detailedPages = framework.pages.filter((page) => page.detailStatus === "detailed").length;
  const allPagesDetailed = detailedPages >= framework.pages.length;

  const compileFeedback = (): string => {
    const parts: string[] = [];
    for (const page of framework.pages) {
      const c = pageComments[page.id]?.trim();
      if (c) parts.push(`【${page.pageTitle}】\n${c}`);
    }
    if (overallComment.trim()) parts.push(`【整體架構意見】\n${overallComment.trim()}`);
    return parts.join("\n\n");
  };

  const handleRegenerate = () => {
    const feedback = compileFeedback();
    onRegenerate(feedback || undefined);
  };

  // Build focus area label reference
  const focusAreaMetas = selectedFocusAreas
    .map((id) => ALL_FOCUS_AREAS.find((f) => f.id === id))
    .filter(Boolean) as typeof ALL_FOCUS_AREAS;

  return (
    <div className="space-y-4">
      {/* Project title */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-bold text-gray-900">{framework.projectTitle}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <Tag color="gray">{framework.geography}</Tag>
          <Tag color="gray">{framework.analysisPurpose}</Tag>
          <Tag color="gray">{framework.timeHorizon}</Tag>
          <Tag color={allPagesDetailed ? "emerald" : "amber"}>
            已補齊 {detailedPages} / {framework.pages.length} 頁
          </Tag>
        </div>
      </div>

      {onEnrichDetails && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">漸進式細節補齊</p>
              <p className="text-xs text-gray-500 mt-1">
                目前已補齊 {detailedPages} / {framework.pages.length} 頁。你可以先直接開始研究，也可以每次補 2–3 頁細節。
              </p>
              {detailError && (
                <p className="text-xs text-red-600 mt-1">{detailError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onEnrichDetails}
              disabled={isEnrichingDetails || allPagesDetailed}
              className="border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {allPagesDetailed
                ? "細節已補齊"
                : isEnrichingDetails
                ? "補齊中..."
                : "補齊下一批細節"}
            </button>
          </div>
        </div>
      )}

      {/* Industry definition */}
      <Collapse title="產業初步定義" badge={<Tag color="violet">Industry Definition</Tag>} defaultOpen>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-amber-700 mb-1">產業本質一句話</p>
            <p className="text-sm text-amber-900 leading-relaxed">{framework.industryDefinition.coreNatureOneLiner}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">包含 Included</p>
              <ul className="space-y-1">
                {framework.industryDefinition.included.map((item, i) => (
                  <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">不包含 Excluded</p>
              <ul className="space-y-1">
                {framework.industryDefinition.excluded.map((item, i) => (
                  <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                    <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">價值鏈 Value Chain</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "上游 Upstream", items: framework.industryDefinition.valueChain.upstream, cls: "bg-blue-50 text-blue-700" },
                { label: "中游 Midstream", items: framework.industryDefinition.valueChain.midstream, cls: "bg-violet-50 text-violet-700" },
                { label: "下游 Downstream", items: framework.industryDefinition.valueChain.downstream, cls: "bg-emerald-50 text-emerald-700" },
              ].map(({ label, items, cls }) => (
                <div key={label} className={`rounded-lg p-3 ${cls}`}>
                  <p className="text-xs font-semibold mb-1.5">{label}</p>
                  <ul className="space-y-1">
                    {items.map((item, i) => (
                      <li key={i} className="text-xs">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {framework.industryDefinition.framingNotes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">分析難點 Framing Notes</p>
              <ul className="space-y-1.5">
                {framework.industryDefinition.framingNotes.map((note, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                    <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Collapse>

      {/* Players */}
      <Collapse
        title="主要玩家"
        badge={
          <span className="text-xs text-gray-500">
            {framework.possiblePlayers.leaders.length +
              framework.possiblePlayers.challengers.length +
              framework.possiblePlayers.disruptors.length +
              framework.possiblePlayers.commodityPlayers.length} 家
          </span>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { label: "Leaders", color: "bg-blue-100 text-blue-800", players: framework.possiblePlayers.leaders },
            { label: "Challengers", color: "bg-orange-100 text-orange-800", players: framework.possiblePlayers.challengers },
            { label: "Disruptors", color: "bg-red-100 text-red-800", players: framework.possiblePlayers.disruptors },
            { label: "Commodity Players", color: "bg-gray-100 text-gray-700", players: framework.possiblePlayers.commodityPlayers },
          ].map(({ label, color, players }) => (
            <div key={label}>
              <div className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded mb-2 ${color}`}>
                {label}
                <span className="ml-1 font-normal opacity-70">({players.length})</span>
              </div>
              {players.length === 0 ? (
                <p className="text-xs text-gray-400 pl-1">－</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {players.map((p, i) => <PlayerRow key={i} player={p} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      </Collapse>

      {/* Data gaps */}
      {framework.dataGapsToResolve.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <p className="text-xs font-semibold text-amber-700 mb-2">待解決的資料缺口 Data Gaps to Resolve</p>
          <ul className="space-y-1">
            {framework.dataGapsToResolve.map((gap, i) => (
              <li key={i} className="text-xs text-amber-800 flex gap-1.5">
                <span className="shrink-0">•</span>
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pages — ordered by focus area selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            逐頁研究架構 — {framework.pages.length} 頁
          </p>
          {totalComments > 0 && (
            <span className="text-xs text-blue-600 flex items-center gap-1">
              <MessageSquare size={12} />
              已有 {totalComments} 則意見
            </span>
          )}
        </div>

        {/* Selected focus areas reference strip */}
        {focusAreaMetas.length > 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-3">
            <p className="text-xs text-gray-400 font-medium mb-2">
              你選擇的 {focusAreaMetas.length} 個分析重點（請核對以下頁面均有涵蓋）
            </p>
            <div className="flex flex-wrap gap-1.5">
              {focusAreaMetas.map((meta) => (
                <span key={meta.id} className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                  {meta.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {framework.pages.map((page) => (
            <PageCard
              key={page.id}
              page={page}
              comment={pageComments[page.id] ?? ""}
              onCommentChange={(v) => setPageComment(page.id, v)}
            />
          ))}
        </div>
      </div>

      {/* Overall comment */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
          <MessageSquare size={13} className="text-gray-400" />
          整體架構意見
        </p>
        <textarea
          value={overallComment}
          onChange={(e) => setOverallComment(e.target.value)}
          placeholder="例如：希望多加一頁分析 AI 替代風險、把市場規模拆成三個地區分開討論、Executive Summary 要更強調投資結論..."
          rows={4}
          className={`w-full text-sm border rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition placeholder:text-gray-300 ${
            overallComment.trim()
              ? "border-blue-200 bg-blue-50/30 text-gray-700"
              : "border-gray-200 text-gray-700"
          }`}
        />
        {totalComments > 0 && (
          <p className="text-xs text-blue-600 mt-1.5">
            你的 {totalComments} 則意見會一起提交給 Claude 重新產生架構。
          </p>
        )}
      </div>

      {/* Action bar */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-4 sm:rounded-xl sm:border sm:bg-white sm:p-4">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleRegenerate}
            className="border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            {totalComments > 0 ? `依意見重新產生架構` : "重新產生架構"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
          >
            確認架構並開始研究
          </button>
        </div>
      </div>
    </div>
  );
}
