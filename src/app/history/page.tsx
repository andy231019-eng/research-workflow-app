'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Download, FileText, ArrowLeft } from "lucide-react";
import { loadHistory, deleteHistoryEntry, clearHistory } from "@/lib/history";
import { downloadMarkdown } from "@/lib/report/markdownDownload";
import type { HistoryEntry } from "@/lib/history";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setEntries(loadHistory());
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearHistory();
    setEntries([]);
    setConfirmClear(false);
  };

  const handleDownload = (entry: HistoryEntry) => {
    downloadMarkdown(entry.markdown, entry.industryName, {
      title: entry.title,
      geography: entry.geography,
    });
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
            >
              <ArrowLeft size={15} />
              返回
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">研究歷史紀錄</h1>
              <p className="text-xs text-gray-500 mt-0.5">儲存在本機瀏覽器，共 {entries.length} 筆</p>
            </div>
          </div>
          {entries.length > 0 && (
            <button
              onClick={handleClearAll}
              className={`text-xs border rounded-lg px-3 py-1.5 transition ${
                confirmClear
                  ? "border-red-300 bg-red-50 text-red-600 font-medium"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {confirmClear ? "再按一次確認清除全部" : "清除全部"}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {entries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <FileText className="mx-auto text-gray-300 mb-4" size={40} />
            <p className="text-gray-500 text-sm">目前沒有歷史紀錄</p>
            <p className="text-gray-400 text-xs mt-1">完成一份研究報告後，會自動儲存在這裡</p>
            <Link
              href="/"
              className="inline-block mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              開始新研究
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Entry header */}
                <div className="flex items-start gap-4 p-5">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-gray-900 truncate">{entry.title}</h2>
                      {entry.isMock && (
                        <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                          MOCK
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-500">{entry.industryName}</span>
                      {entry.geography && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500">{entry.geography}</span>
                        </>
                      )}
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDate(entry.createdAt)}</span>
                    </div>
                    {entry.sources.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {entry.sources.length} 個來源 · {entry.dataGaps.length} 個資料缺口
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDownload(entry)}
                      className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition"
                      title="下載 Markdown"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">.md</span>
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition"
                      title="刪除"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Expanded preview */}
                {expandedId === entry.id && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">報告預覽</p>
                      <button
                        onClick={() => handleDownload(entry)}
                        className="flex items-center gap-1.5 text-xs bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-700 transition"
                      >
                        <Download size={12} />
                        下載 .md 檔
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
                        {entry.markdown.slice(0, 3000)}
                        {entry.markdown.length > 3000 && "\n\n... （預覽截斷，請下載完整報告）"}
                      </pre>
                    </div>
                    {entry.dataGaps.length > 0 && (
                      <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                        <p className="text-xs font-medium text-amber-700 mb-1.5">資料缺口</p>
                        <ul className="space-y-1">
                          {entry.dataGaps.map((gap, i) => (
                            <li key={i} className="text-xs text-amber-800 flex gap-1.5">
                              <span>•</span>{gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
