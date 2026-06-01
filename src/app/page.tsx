'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import IndustryStep from "@/components/IndustryStep";
import SubcategorySelector from "@/components/SubcategorySelector";
import ResearchInputForm from "@/components/ResearchInputForm";
import FrameworkReview from "@/components/FrameworkReview";
import ReportPreview from "@/components/ReportPreview";
import LoadingState from "@/components/LoadingState";
import ErrorAlert from "@/components/ErrorAlert";
import { MOCK_FRAMEWORK, MOCK_REPORT, MOCK_SUBCATEGORIES, delay } from "@/lib/mockData";
import { saveToHistory } from "@/lib/history";
import type {
  AppPhase,
  UserResearchInput,
  ResearchFramework,
  GeneratedReport,
  IndustrySubcategory,
  Geography,
} from "@/types/research";
import { GEOGRAPHY_LABELS } from "@/types/research";

function geoLabel(geographies: Geography[], geographyOther?: string): string {
  return geographies
    .map((g) => (g === "other" && geographyOther ? geographyOther : GEOGRAPHY_LABELS[g]))
    .join("、");
}

function geoLabelFromInput(input: UserResearchInput): string {
  return geoLabel(input.geographies, input.geographyOther);
}

interface AppState {
  phase: AppPhase;
  mockMode: boolean;
  apiKey: string;
  // Step 1: industry narrowing
  pendingIndustry: string;
  pendingGeographies: Geography[];
  pendingGeographyOther: string;
  subcategoryOptions: IndustrySubcategory[];
  // Step 2+
  input: UserResearchInput | null;
  framework: ResearchFramework | null;
  report: GeneratedReport | null;
  error: string;
  frameworkNotice: string;
  loadingMessage: string;
  loadingElapsedSeconds: number;
  streamPreview: string;
  isEnrichingDetails: boolean;
  detailError: string;
  reportProgress: number;
  reportProgressLabel: string;
}

const INITIAL: AppState = {
  phase: "input",
  mockMode: false,
  apiKey: "",
  pendingIndustry: "",
  pendingGeographies: ["global"],
  pendingGeographyOther: "",
  subcategoryOptions: [],
  input: null,
  framework: null,
  report: null,
  error: "",
  frameworkNotice: "",
  loadingMessage: "",
  loadingElapsedSeconds: 0,
  streamPreview: "",
  isEnrichingDetails: false,
  detailError: "",
  reportProgress: 0,
  reportProgressLabel: "",
};

const FRAMEWORK_TIMEOUT_MS = 90_000;

const STEPS = [
  { id: 1, label: "定義產業" },
  { id: 2, label: "研究設定" },
  { id: 3, label: "確認架構" },
  { id: 4, label: "產出報告" },
];

function StepIndicator({ phase }: { phase: AppPhase }) {
  const activeStep =
    phase === "input" || phase === "generating_subcategories" || phase === "selecting_subcategory"
      ? 1
      : phase === "input_details"
      ? 2
      : phase === "generating_framework" || phase === "reviewing_framework"
      ? 3
      : phase === "generating_report" || phase === "report_ready"
      ? 4
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
            <div className={`w-10 h-px mx-2 ${step.id < activeStep ? "bg-gray-900" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function previewResponseBody(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "(empty response body)";
  return normalized.slice(0, 300);
}

type ApiErrorResponse = {
  error?: string;
  requestId?: string;
  fallbackFramework?: ResearchFramework;
};

function isErrorResponse(data: unknown): data is ApiErrorResponse {
  return Boolean(data && typeof data === "object" && "error" in data);
}

function formatServerError(data: { error?: string; requestId?: string }, fallback: string): string {
  const message = data.error?.trim() || fallback;
  return data.requestId ? `${message}\nRequest ID: ${data.requestId}` : message;
}

function reportPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    research_write: "搜尋資料並撰寫",
    fallback: "切換純模型模式",
    rewrite: "補強來源與重寫",
    validation: "檢查來源格式",
    audit: "二次審核關鍵數字",
    audit_warning: "整理審核提醒",
    finalize: "整理最終報告",
    done: "完成",
  };
  return labels[phase] ?? "處理中";
}

async function readJsonResponse<T>(res: Response, fallbackLabel: string): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        `${fallbackLabel}: 部署層錯誤（HTTP ${res.status} ${res.statusText || ""}）。這通常代表 Netlify function timeout/crash 或 upstream request 未正常結束；請用 Netlify logs 對照發生時間。`
      );
    }
    throw new Error(
      `${fallbackLabel}: HTTP ${res.status} ${res.statusText || ""}; response body is empty.`
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const contentType = res.headers.get("content-type") || "(missing content-type)";
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        `${fallbackLabel}: 部署層錯誤（HTTP ${res.status} ${res.statusText || ""}），伺服器沒有回傳 JSON。這通常不是研究模組數量造成，而是 Netlify function/proxy timeout 或 crash。Preview: ${previewResponseBody(text)}`
      );
    }
    throw new Error(
      `${fallbackLabel}: HTTP ${res.status} ${res.statusText || ""}; expected JSON but received ${contentType}. Preview: ${previewResponseBody(text)}`
    );
  }
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

  // ── Step 0: Analyze industry subcategories ───────────────────────────────
  const handleAnalyzeIndustry = async (
    industryName: string,
    geographies: Geography[],
    geographyOther?: string
  ) => {
    set({
      phase: "generating_subcategories",
      pendingIndustry: industryName,
      pendingGeographies: geographies,
      pendingGeographyOther: geographyOther ?? "",
      error: "",
      loadingMessage: `Claude 正在分析「${industryName}」的產業結構與子分類...`,
    });

    if (state.mockMode) {
      await delay(1200);
      set({
        phase: "selecting_subcategory",
        subcategoryOptions: MOCK_SUBCATEGORIES,
        loadingMessage: "",
      });
      return;
    }

    try {
      const res = await fetch("/api/analyze-industry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industryName,
          geographies,
          geographyOther,
          apiKey: state.apiKey || undefined,
        }),
      });

      const data = await readJsonResponse<{ subcategories?: IndustrySubcategory[]; error?: string }>(
        res,
        "Industry analysis failed"
      );

      if (!res.ok) {
        throw new Error(
          data.error?.trim() || `Industry analysis failed: HTTP ${res.status}`
        );
      }

      const subcategories = data.subcategories ?? [];
      if (subcategories.length === 0) {
        throw new Error("Claude 未能產生子分類，請再試一次。");
      }

      set({ phase: "selecting_subcategory", subcategoryOptions: subcategories, loadingMessage: "" });
    } catch (err) {
      set({
        phase: "error",
        error: err instanceof Error ? err.message : "產業分析失敗",
        loadingMessage: "",
      });
    }
  };

  // ── Step 1: Subcategory selected → show research details form ────────────
  const handleSubcategorySelected = (subcategory: IndustrySubcategory | null) => {
    const finalIndustry = subcategory
      ? `${subcategory.name}（${state.pendingIndustry}）`
      : state.pendingIndustry;

    set({
      phase: "input_details",
      pendingIndustry: finalIndustry,
    });
  };

  // ── Step 2: Generate framework ───────────────────────────────────────────
  const handleGenerateFramework = async (input: UserResearchInput, feedback?: string) => {
    set({
      phase: "generating_framework",
      input,
      error: "",
      frameworkNotice: "",
      loadingMessage: "Claude 正在定義產業邊界、拆解 value chain、產生逐頁研究架構...",
      loadingElapsedSeconds: 0,
      detailError: "",
    });

    if (state.mockMode) {
      await delay(1800);
      set({ phase: "reviewing_framework", framework: MOCK_FRAMEWORK, frameworkNotice: "", loadingMessage: "" });
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
      const data = await readJsonResponse<ResearchFramework | ApiErrorResponse>(
        res,
        "Framework generation response parse failed"
      );
      if (!res.ok) {
        if (isErrorResponse(data) && data.fallbackFramework) {
          set({
            phase: "reviewing_framework",
            framework: data.fallbackFramework,
            frameworkNotice: formatServerError(
              data,
              "Framework generation timed out; fallback framework is shown."
            ),
            loadingMessage: "",
            loadingElapsedSeconds: 0,
          });
          return;
        }
        throw new Error(
          isErrorResponse(data)
            ? formatServerError(data, `Framework generation failed: HTTP ${res.status} ${res.statusText || ""}`)
            : `Framework generation failed: HTTP ${res.status} ${res.statusText || ""}`
        );
      }
      if (isErrorResponse(data)) {
        throw new Error(
          formatServerError(data, "Framework generation returned an error response without an error message.")
        );
      }
      set({
        phase: "reviewing_framework",
        framework: data,
        frameworkNotice: "",
        loadingMessage: "",
        loadingElapsedSeconds: 0,
      });
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
        frameworkNotice: "",
        loadingElapsedSeconds: 0,
      });
    } finally {
      if (timeout !== undefined) window.clearTimeout(timeout);
    }
  };

  const handleEnrichFrameworkDetails = async () => {
    if (!state.framework || !state.input || state.isEnrichingDetails) return;

    const pageIds = state.framework.pages
      .filter((page) => page.detailStatus !== "detailed")
      .slice(0, 3)
      .map((page) => page.id);

    if (pageIds.length === 0) return;

    set({ isEnrichingDetails: true, detailError: "" });

    try {
      const res = await fetch("/api/enrich-framework-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: state.input,
          framework: state.framework,
          pageIds,
          apiKey: state.apiKey || undefined,
        }),
      });

      const data = await readJsonResponse<{ pages?: ResearchFramework["pages"]; error?: string }>(
        res,
        "Framework detail enrichment response parse failed"
      );

      if (!res.ok) {
        throw new Error(data.error?.trim() || `Framework detail enrichment failed: HTTP ${res.status}`);
      }

      const detailedPages = data.pages ?? [];
      const byId = new Map(detailedPages.map((page) => [page.id, page]));

      set((prev) => {
        if (!prev.framework) return {};
        return {
          framework: {
            ...prev.framework,
            pages: prev.framework.pages.map((page) => byId.get(page.id) ?? page),
          },
        };
      });
    } catch (err) {
      set({
        detailError: err instanceof Error ? err.message : "補齊細節失敗，請稍後重試。",
      });
    } finally {
      set({ isEnrichingDetails: false });
    }
  };

  // ── Step 3: Generate report ──────────────────────────────────────────────
  const handleGenerateReport = async () => {
    if (!state.framework || !state.input) return;

    set({
      phase: "generating_report",
      error: "",
      frameworkNotice: "",
      streamPreview: "",
      loadingMessage: "Claude 正在根據確認後的研究架構搜尋資料並撰寫完整研究報告...",
      reportProgress: 8,
      reportProgressLabel: "準備搜尋與撰寫",
    });

    if (state.mockMode) {
      await delay(2200);
      saveToHistory(MOCK_REPORT, state.input.industryName, geoLabelFromInput(state.input), true);
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
          let event: {
            type: string;
            message?: string;
            text?: string;
            report?: GeneratedReport;
            progress?: number;
            phase?: string;
          };
          try {
          event = JSON.parse(line.slice(6)) as typeof event;
          } catch {
            continue;
          }

          if (event.type === "status" && event.message) {
            set((prev) => ({
              loadingMessage: event.message ?? prev.loadingMessage,
              reportProgress:
                typeof (event as { progress?: unknown }).progress === "number"
                  ? Math.max(prev.reportProgress, (event as { progress: number }).progress)
                  : prev.reportProgress,
              reportProgressLabel:
                typeof (event as { phase?: unknown }).phase === "string"
                  ? reportPhaseLabel((event as { phase: string }).phase)
                  : prev.reportProgressLabel,
            }));
          } else if (event.type === "chunk" && event.text) {
            set((prev) => ({
              streamPreview: (prev.streamPreview ?? "") + event.text,
              reportProgress: Math.min(58, Math.max(prev.reportProgress, prev.reportProgress + 0.4)),
              reportProgressLabel: prev.reportProgressLabel || "搜尋與撰寫中",
            }));
          } else if (event.type === "done" && event.report) {
            report = event.report;
            set({ reportProgress: 100, reportProgressLabel: "完成" });
          } else if (event.type === "error" && event.message) {
            throw new Error(event.message);
          }
        }
      }

      if (report) {
        saveToHistory(report, state.input.industryName, geoLabelFromInput(state.input), false);
        set({ phase: "report_ready", report, loadingMessage: "", streamPreview: "", reportProgress: 100, reportProgressLabel: "" });
      } else {
        throw new Error("Report generation completed but no report was received.");
      }
    } catch (err) {
      set({
        phase: "error",
        error: err instanceof Error ? err.message : "生成報告失敗",
        loadingMessage: "",
        reportProgress: 0,
        reportProgressLabel: "",
      });
    }
  };

  const pendingGeoLabel = geoLabel(state.pendingGeographies, state.pendingGeographyOther);

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

        {/* Step 1a: Industry input */}
        {state.phase === "input" && (
          <IndustryStep
            apiKey={state.apiKey}
            mockMode={state.mockMode}
            onApiKeyChange={(k) => set({ apiKey: k })}
            onMockModeChange={(m) => set({ mockMode: m })}
            onSubmit={handleAnalyzeIndustry}
          />
        )}

        {/* Step 1b: Loading subcategories */}
        {state.phase === "generating_subcategories" && (
          <LoadingState
            message={state.loadingMessage}
            subMessage={
              state.mockMode
                ? "Mock 模式：模擬產業子分類分析中..."
                : "通常只需要 5–10 秒。Claude 正在分析產業邊界與子分類結構。"
            }
          />
        )}

        {/* Step 1c: Select subcategory */}
        {state.phase === "selecting_subcategory" && (
          <SubcategorySelector
            industryName={state.pendingIndustry}
            geoLabel={pendingGeoLabel}
            subcategories={state.subcategoryOptions}
            onSelect={handleSubcategorySelected}
          />
        )}

        {/* Step 2: Research details form */}
        {state.phase === "input_details" && (
          <ResearchInputForm
            apiKey={state.apiKey}
            mockMode={state.mockMode}
            onApiKeyChange={(k) => set({ apiKey: k })}
            onMockModeChange={(m) => set({ mockMode: m })}
            onSubmit={handleGenerateFramework}
            lockedIndustry={state.pendingIndustry}
            lockedGeographies={state.pendingGeographies}
            lockedGeographyOther={state.pendingGeographyOther}
          />
        )}

        {/* Step 3a: Generating framework */}
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

        {/* Step 3b: Review framework */}
        {state.phase === "reviewing_framework" && state.framework && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Step 3</p>
              <h2 className="text-lg font-bold text-gray-900">確認研究架構</h2>
              <p className="text-sm text-gray-500 mt-1">
                確認後 Claude 會開始搜尋資料並撰寫完整研究報告。如果架構不符合預期，可以重新產生。
              </p>
            </div>
            {state.frameworkNotice && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-900">已改用 fallback 研究大綱</p>
                <p className="text-xs text-amber-800 mt-1 whitespace-pre-wrap">{state.frameworkNotice}</p>
              </div>
            )}
            <FrameworkReview
              framework={state.framework}
              selectedFocusAreas={(state.input?.selectedFocusAreas ?? []) as import("@/types/research").FocusArea[]}
              onConfirm={handleGenerateReport}
              onRegenerate={(feedback) => {
                if (state.input) handleGenerateFramework(state.input, feedback);
              }}
              onEnrichDetails={handleEnrichFrameworkDetails}
              isEnrichingDetails={state.isEnrichingDetails}
              detailError={state.detailError}
            />
          </div>
        )}

        {/* Step 4a: Generating report */}
        {state.phase === "generating_report" && (
          <div className="space-y-4">
            <LoadingState
              message={state.loadingMessage}
              progress={state.reportProgress}
              progressLabel={state.reportProgressLabel}
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

        {/* Step 4b: Report ready */}
        {state.phase === "report_ready" && state.report && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Step 4</p>
              <h2 className="text-lg font-bold text-gray-900">研究報告完成</h2>
              {state.mockMode && (
                <p className="text-xs text-amber-600 mt-1">
                  此為 Mock 模式展示資料，非真實 Claude 生成報告。
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

        {/* Error */}
        {state.phase === "error" && (
          <ErrorAlert
            error={state.error}
            onRetry={
              state.pendingIndustry
                ? () => handleAnalyzeIndustry(state.pendingIndustry, state.pendingGeographies, state.pendingGeographyOther)
                : undefined
            }
            onReset={reset}
          />
        )}
      </main>
    </div>
  );
}
