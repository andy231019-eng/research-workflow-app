'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import ResearchInputForm from "@/components/ResearchInputForm";
import FrameworkReview from "@/components/FrameworkReview";
import ReportPreview from "@/components/ReportPreview";
import LoadingState from "@/components/LoadingState";
import ErrorAlert from "@/components/ErrorAlert";
import { MOCK_FRAMEWORK, MOCK_REPORT, delay } from "@/lib/mockData";
import { saveToHistory } from "@/lib/history";
import type {
  AppPhase,
  UserResearchInput,
  ResearchFramework,
  GeneratedReport,
} from "@/types/research";
import { GEOGRAPHY_LABELS } from "@/types/research";

function geoLabel(input: UserResearchInput): string {
  return input.geographies
    .map((g) => (g === "other" && input.geographyOther ? input.geographyOther : GEOGRAPHY_LABELS[g]))
    .join("、");
}

interface AppState {
  phase: AppPhase;
  mockMode: boolean;
  apiKey: string;
  input: UserResearchInput | null;
  framework: ResearchFramework | null;
  report: GeneratedReport | null;
  error: string;
  loadingMessage: string;
  loadingElapsedSeconds: number;
  streamPreview: string;
}

const INITIAL: AppState = {
  phase: "input",
  mockMode: false,
  apiKey: "",
  input: null,
  framework: null,
  report: null,
  error: "",
  loadingMessage: "",
  loadingElapsedSeconds: 0,
  streamPreview: "",
};

const FRAMEWORK_TIMEOUT_MS = 90_000;

const STEPS = [
  { id: 1, label: "研究需求" },
  { id: 2, label: "確認架構" },
  { id: 3, label: "產出報告" },
];

function StepIndicator({ phase }: { phase: AppPhase }) {
  const activeStep =
    phase === "input" || phase === "generating_framework"
      ? 1
      : phase === "reviewing_framework" || phase === "generating_report"
      ? 2
      : phase === "report_ready"
      ? 3
      : 1;

  return (
    <div className="flex items-center mb-8">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step.id < activeStep
                  ? "bg-gray-900 text-white"
                  : step.id === activeStep
                  ? "bg-gray-900 text-white ring-4 ring-gray-200"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {step.id < activeStep ? (
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className={`text-sm hidden sm:block ${
                step.id === activeStep ? "font-semibold text-gray-900" : step.id < activeStep ? "text-gray-600" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 h-px mx-2 ${step.id < activeStep ? "bg-gray-900" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [state, setState] = useState<AppState>(INITIAL);

  const set = (patch: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) =>
    setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));

  useEffect(() => {
    if (state.phase !== "generating_framework") return;

    const timer = window.setInterval(() => {
      setState((s) =>
        s.phase === "generating_framework"
          ? { ...s, loadingElapsedSeconds: s.loadingElapsedSeconds + 1 }
          : s
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state.phase]);

  const reset = () =>
    setState((s) => ({ ...INITIAL, mockMode: s.mockMode, apiKey: s.apiKey }));

  // ── Step 1: Generate framework ───────────────────────────────────────────
  const handleGenerateFramework = async (input: UserResearchInput, feedback?: string) => {
    set({
      phase: "generating_framework",
      input,
      error: "",
      loadingMessage: "Claude 正在定義產業邊界、拆解 value chain、產生逐頁研究架構...",
      loadingElapsedSeconds: 0,
    });

    if (state.mockMode) {
      await delay(1800);
      set({ phase: "reviewing_framework", framework: MOCK_FRAMEWORK, loadingMessage: "" });
      return;
    }

    const bodyInput = feedback
      ? {
          ...input,
          customFocus: [input.customFocus, `[使用者架構修改意見]\n${feedback}`]
            .filter(Boolean)
            .join("\n\n"),
        }
      : input;

    let timeout: number | undefined;
    let timedOut = false;

    try {
      const controller = new AbortController();
      timeout = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, FRAMEWORK_TIMEOUT_MS);

      const res = await fetch("/api/generate-framework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bodyInput, apiKey: state.apiKey || undefined }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Framework generation failed");
      set({ phase: "reviewing_framework", framework: data, loadingMessage: "", loadingElapsedSeconds: 0 });
    } catch (err) {
      const isAbortError =
        timedOut || (err instanceof DOMException && err.name === "AbortError");
      set({
        phase: "error",
        error: isAbortError
          ? "Claude 超過 90 秒未回應，可能是 API 忙碌、網路不穩，或模型輸出過長。請稍後重試，或縮小研究範圍後再產生架構。"
          : err instanceof Error
          ? err.message
          : "生成研究架構失敗",
        loadingMessage: "",
        loadingElapsedSeconds: 0,
      });
    } finally {
      if (timeout !== undefined) window.clearTimeout(timeout);
    }
  };

  // ── Step 2: Generate report ──────────────────────────────────────────────
  const handleGenerateReport = async () => {
    if (!state.framework || !state.input) return;

    set({
      phase: "generating_report",
      error: "",
      streamPreview: "",
      loadingMessage: "Claude 正在根據確認後的研究架構搜尋資料並撰寫完整研究報告...",
    });

    if (state.mockMode) {
      await delay(2200);
      saveToHistory(
        MOCK_REPORT,
        state.input.industryName,
        geoLabel(state.input),
        true
      );
      set({ phase: "report_ready", report: MOCK_REPORT, loadingMessage: "" });
      return;
    }

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: state.input,
          framework: state.framework,
          apiKey: state.apiKey || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Report generation failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let report: GeneratedReport | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as {
              type: string;
              message?: string;
              text?: string;
              report?: GeneratedReport;
            };
            if (event.type === "status" && event.message) {
              set({ loadingMessage: event.message });
            } else if (event.type === "chunk" && event.text) {
              set((prev) => ({ streamPreview: (prev.streamPreview ?? "") + event.text }));
            } else if (event.type === "done" && event.report) {
              report = event.report;
            } else if (event.type === "error" && event.message) {
              throw new Error(event.message);
            }
          } catch {
            // ignore malformed SSE
          }
        }
      }

      if (report) {
        saveToHistory(
          report,
          state.input.industryName,
          geoLabel(state.input),
          false
        );
        set({ phase: "report_ready", report, loadingMessage: "", streamPreview: "" });
      } else {
        throw new Error("Report generation completed but no report was received.");
      }
    } catch (err) {
      set({
        phase: "error",
        error: err instanceof Error ? err.message : "生成報告失敗",
        loadingMessage: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">General Industry Analysis Agent</h1>
            <p className="text-xs text-gray-500 mt-0.5">通用產業分析 Agent · Powered by Claude</p>
          </div>
          <div className="flex items-center gap-3">
            {state.mockMode && (
              <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                MOCK MODE
              </span>
            )}
            <Link
              href="/history"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
            >
              <History size={13} />
              歷史紀錄
            </Link>
            {state.phase !== "input" && (
              <button
                onClick={reset}
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
              >
                重新開始
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <StepIndicator phase={state.phase} />

        {state.phase === "input" && (
          <ResearchInputForm
            apiKey={state.apiKey}
            mockMode={state.mockMode}
            onApiKeyChange={(k) => set({ apiKey: k })}
            onMockModeChange={(m) => set({ mockMode: m })}
            onSubmit={handleGenerateFramework}
          />
        )}

        {state.phase === "generating_framework" && (
          <LoadingState
            message={state.loadingMessage}
            elapsedSeconds={state.loadingElapsedSeconds}
            statusHint={
              state.mockMode
                ? undefined
                : state.loadingElapsedSeconds < 30
                ? "目前仍在正常生成時間內。"
                : state.loadingElapsedSeconds < 60
                ? "這次比平常久，但 Claude 仍可能正在整理架構。"
                : "已超過預期時間；可再等一下，或按重新開始後縮小研究範圍重試。"
            }
            subMessage={
              state.mockMode
                ? "Mock 模式：模擬 Claude 生成中..."
                : "通常需要 15–30 秒。Claude 正在思考產業邊界、價值鏈與研究重點。"
            }
          />
        )}

        {state.phase === "reviewing_framework" && state.framework && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Step 2</p>
              <h2 className="text-lg font-bold text-gray-900">確認研究架構</h2>
              <p className="text-sm text-gray-500 mt-1">
                確認後 Claude 會開始搜尋資料並撰寫完整研究報告。如果架構不符合預期，可以重新產生。
              </p>
            </div>
            <FrameworkReview
              framework={state.framework}
              selectedFocusAreas={(state.input?.selectedFocusAreas ?? []) as import("@/types/research").FocusArea[]}
              onConfirm={handleGenerateReport}
              onRegenerate={(feedback) => {
                if (state.input) handleGenerateFramework(state.input, feedback);
              }}
            />
          </div>
        )}

        {state.phase === "generating_report" && (
          <div className="space-y-4">
            <LoadingState
              message={state.loadingMessage}
              subMessage={
                state.mockMode
                  ? "Mock 模式：模擬報告生成中..."
                  : "Claude 正在搜尋最新資料、整理 evidence、逐頁撰寫報告。通常需要 1–3 分鐘。"
              }
            />
            {state.streamPreview && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-xs text-gray-500 mb-3">報告生成中（預覽）...</p>
                <div className="text-xs text-gray-600 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {state.streamPreview.slice(-2000)}
                </div>
              </div>
            )}
          </div>
        )}

        {state.phase === "report_ready" && state.report && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Step 3</p>
              <h2 className="text-lg font-bold text-gray-900">研究報告完成</h2>
              {state.mockMode && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠ 此為 Mock 模式展示資料，非真實 Claude 生成報告。
                </p>
              )}
              <p className="text-xs text-emerald-600 mt-1">已自動儲存至歷史紀錄。</p>
            </div>
            <ReportPreview
              report={state.report}
              industryName={state.input?.industryName ?? "industry"}
              onBackToFramework={() => set({ phase: "reviewing_framework", streamPreview: "" })}
              onNewResearch={reset}
            />
          </div>
        )}

        {state.phase === "error" && (
          <ErrorAlert
            error={state.error}
            onRetry={state.input ? () => handleGenerateFramework(state.input!) : undefined}
            onReset={reset}
          />
        )}
      </main>
    </div>
  );
}
