'use client'

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { GeneratedReport } from "@/types/research";
import { downloadMarkdown, downloadPresentationMarkdown } from "@/lib/report/markdownDownload";

interface Props {
  report: GeneratedReport;
  industryName: string;
  onBackToFramework: () => void;
  onNewResearch: () => void;
}

interface ReportSection {
  title: string;
  content: string;
  index: number;
}

const PERPLEXITY_VERIFY_PROMPT = `請驗證並重寫以下產業分析 MD 報告。
要求：保留原本章節架構與標題；逐段檢查事實、數據、公司名稱、時間與推論；刪除或修正無法驗證的內容；補上可信資料來源連結。優先使用官方資料、公司年報/法說會、政府統計、Reuters、Bloomberg、WSJ、FT、Nikkei、McKinsey、Bain、BCG、Deloitte、PwC、Gartner、IDC、TrendForce、Counterpoint 等來源。
輸出格式：只輸出一份完整 Markdown 報告；每個重要 claim 後附來源連結；最後新增「Supporting Facts & Sources」與「Data Gaps」章節。若資料不足，請明確標示「目前公開資料有限，無法可靠判斷」，不要猜測。

以下是待驗證報告：
`;

const RELIABILITY_LABEL: Record<number, string> = {
  1: "低",
  2: "中低",
  3: "中",
  4: "中高",
  5: "高",
};

const CLAIM_TYPE_LABEL = {
  fact: "事實",
  inference: "推論",
  judgment: "判斷",
} as const;

const EVIDENCE_STATUS_LABEL = {
  verified: "已驗證",
  partial: "部分根據",
  unsupported: "未支撐",
} as const;

function parseMarkdownSections(markdown: string): ReportSection[] {
  const sections: ReportSection[] = [];
  // Split on lines starting with exactly ## (not ### or ####)
  const parts = markdown.split(/\n(?=## )/);
  let sectionIndex = 0;

  for (const part of parts) {
    if (!part.trim()) continue;
    const h2Match = part.match(/^## (.+)/m);
    if (h2Match) {
      sections.push({ title: h2Match[1].trim(), content: part, index: sectionIndex++ });
    } else {
      // Intro / title block before first ##
      sections.unshift({ title: "報告概述", content: part, index: -1 });
    }
  }

  return sections;
}

function SectionCard({
  section,
  defaultOpen,
}: {
  section: ReportSection;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left"
      >
        <div className="flex items-center gap-3">
          {section.index >= 0 && (
            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
              {section.index + 1}
            </span>
          )}
          <span className="text-sm font-semibold text-gray-800">{section.title}</span>
        </div>
        {open
          ? <ChevronUp size={15} className="text-gray-400 shrink-0" />
          : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-6 py-5 prose prose-sm max-w-none
          prose-headings:font-semibold prose-headings:text-gray-800
          prose-h2:text-base prose-h3:text-sm
          prose-p:text-gray-700 prose-p:leading-relaxed
          prose-li:text-gray-700 prose-li:text-sm
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-l-gray-300 prose-blockquote:text-gray-600
          prose-code:text-xs prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 rounded-lg border border-gray-200">
                  <table className="w-full text-xs border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-50">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-gray-100">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-gray-50 transition">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2.5 text-xs text-gray-700 align-top">
                  {children}
                </td>
              ),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              a: ({ href, children }: any) => (
                href ? (
                  <span className="inline-flex items-center gap-1">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {children}
                    </a>
                    <span
                      className="text-[10px] text-amber-500"
                      title="此連結由 AI 生成，請自行確認是否有效"
                    >
                      ⚠
                    </span>
                  </span>
                ) : (
                  <span>{children}</span>
                )
              ),
            }}
          >
            {section.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function ReportPreview({
  report,
  industryName,
  onBackToFramework,
  onNewResearch,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"report" | "sources" | "gaps">("report");
  const [allExpanded, setAllExpanded] = useState<boolean | null>(null);

  const sections = parseMarkdownSections(report.markdown);
  const evidenceStats = report.sources.reduce(
    (acc, source) => {
      const status = source.evidenceStatus ?? "verified";
      if (status === "verified") acc.verified += 1;
      else if (status === "partial") acc.partial += 1;
      else acc.unsupported += 1;
      if (source.reliabilityScore <= 2) acc.lowReliability += 1;
      return acc;
    },
    { verified: 0, partial: 0, unsupported: 0, lowReliability: 0 }
  );

  const downloadMeta = {
    title: report.title,
    geography: report.geography,
    analysisPurpose: report.analysisPurpose,
    timeHorizon: report.timeHorizon,
    webSearchUsed: report.webSearchUsed,
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PERPLEXITY_VERIFY_PROMPT + report.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadMarkdown(report.markdown, industryName, downloadMeta);
  };

  const handleDownloadPresentation = () => {
    downloadPresentationMarkdown(report.markdown, industryName, downloadMeta);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">研究報告</p>
            <h2 className="text-base font-bold text-gray-900">{report.title}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-xs text-gray-500">
                生成時間：{new Date(report.createdAt).toLocaleString("zh-TW")}
              </p>
              {report.webSearchUsed === true && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  ✓ Live Web Search
                </span>
              )}
              {report.webSearchUsed === false && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                  ⚠ 僅模型知識，無即時搜尋
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={onBackToFramework}
              className="border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              回到架構修改
            </button>
            <button
              onClick={handleCopy}
              className="border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              title="複製報告全文，並自動附上 Perplexity 資料驗證指令"
            >
              {copied ? "已複製！" : "複製 → Perplexity"}
            </button>
            <button
              onClick={handleDownloadPresentation}
              className="border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              title="去除來源表格與資料缺口，適合直接餵給簡報 Agent"
            >
              簡報用 .md
            </button>
            <button
              onClick={handleDownload}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              下載 .md
            </button>
            <button
              onClick={onNewResearch}
              className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              新研究
            </button>
          </div>
        </div>
      </div>

      {/* Evidence summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              可信度檢查
            </p>
            <p className="text-sm text-gray-700">
              正式報告僅應使用已驗證或明確標示為部分根據的內容；未能驗證者列入資料缺口。
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
              <p className="text-base font-bold text-emerald-700">{evidenceStats.verified}</p>
              <p className="text-[11px] text-emerald-700">已驗證</p>
            </div>
            <div className="rounded-lg border border-yellow-100 bg-yellow-50 px-3 py-2">
              <p className="text-base font-bold text-yellow-700">{evidenceStats.partial}</p>
              <p className="text-[11px] text-yellow-700">部分根據</p>
            </div>
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2">
              <p className="text-base font-bold text-red-700">{evidenceStats.unsupported}</p>
              <p className="text-[11px] text-red-700">未支撐</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-base font-bold text-gray-700">{evidenceStats.lowReliability}</p>
              <p className="text-[11px] text-gray-600">低可靠度</p>
            </div>
          </div>
        </div>
        {report.dataGaps.length > 0 && (
          <div className="mt-4 border border-amber-200 bg-amber-50 text-amber-800 rounded-lg px-3 py-2 text-sm">
            本報告有 {report.dataGaps.length} 個未能驗證或資料不足的問題，已集中列在「資料缺口」。
          </div>
        )}
      </div>

      {/* Source URL disclaimer */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <span className="shrink-0 mt-0.5">⚠</span>
        <span>
          本報告來源 URL 由 AI 生成，系統未驗證連結有效性。引用前請逐一確認來源真實存在，避免引用無效或幻覺連結。
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { id: "report" as const, label: `報告（${sections.length} 節）` },
          { id: "sources" as const, label: `來源 (${report.sources.length})` },
          { id: "gaps" as const, label: `資料缺口 (${report.dataGaps.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report sections */}
      {activeTab === "report" && (
        <div className="space-y-2">
          {/* Expand/collapse all toggle */}
          <div className="flex justify-end">
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setAllExpanded(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                全部展開
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => setAllExpanded(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                全部收合
              </button>
            </div>
          </div>

          {sections.map((section, i) => (
            <SectionCard
              key={section.index}
              section={section}
              defaultOpen={allExpanded !== null ? allExpanded : i <= 1}
            />
          ))}
        </div>
      )}

      {/* Sources */}
      {activeTab === "sources" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {report.sources.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">無來源資料</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-[35%]">Claim</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Claim 類型</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">證據狀態</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">來源</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">類型</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">日期</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">可靠度</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.sources.map((source, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{source.claim}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {CLAIM_TYPE_LABEL[source.claimType ?? "fact"]}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            (source.evidenceStatus ?? "verified") === "verified"
                              ? "bg-emerald-50 text-emerald-700"
                              : (source.evidenceStatus ?? "verified") === "partial"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {EVIDENCE_STATUS_LABEL[source.evidenceStatus ?? "verified"]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {source.sourceUrl ? (
                          <div className="flex items-start gap-1.5">
                            <a
                              href={source.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {source.sourceTitle}
                            </a>
                            <span
                              className="shrink-0 text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1 py-0.5 rounded font-medium leading-none mt-0.5"
                              title="此連結由 AI 生成，請自行確認是否有效"
                            >
                              未驗證
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600">{source.sourceTitle}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{source.sourceType}</td>
                      <td className="px-4 py-3 text-gray-500">{source.date ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            source.reliabilityScore >= 4
                              ? "bg-emerald-50 text-emerald-700"
                              : source.reliabilityScore === 3
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {RELIABILITY_LABEL[source.reliabilityScore] ?? source.reliabilityScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Data gaps */}
      {activeTab === "gaps" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          {report.dataGaps.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">無資料缺口</p>
          ) : (
            <ul className="space-y-2">
              {report.dataGaps.map((gap, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                  {gap}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
