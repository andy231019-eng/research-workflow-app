import type { GeneratedReport } from "@/types/research";

export interface HistoryEntry {
  id: string;
  title: string;
  industryName: string;
  geography: string;
  createdAt: string;
  markdown: string;
  sources: GeneratedReport["sources"];
  dataGaps: string[];
  isMock?: boolean;
}

const STORAGE_KEY = "industry_analysis_history";
const MAX_ENTRIES = 20;

function isAvailable(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function saveToHistory(report: GeneratedReport, industryName: string, geography: string, isMock = false): void {
  if (!isAvailable()) return;
  try {
    const entries = loadHistory();
    const newEntry: HistoryEntry = {
      id: report.id,
      title: report.title,
      industryName,
      geography,
      createdAt: report.createdAt,
      markdown: report.markdown,
      sources: report.sources,
      dataGaps: report.dataGaps,
      isMock,
    };
    const updated = [newEntry, ...entries.filter((e) => e.id !== report.id)].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage quota exceeded or unavailable — silently skip
  }
}

export function loadHistory(): HistoryEntry[] {
  if (!isAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function deleteHistoryEntry(id: string): void {
  if (!isAvailable()) return;
  try {
    const entries = loadHistory().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

export function clearHistory(): void {
  if (!isAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
