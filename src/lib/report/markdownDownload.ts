export interface DownloadMeta {
  title?: string;
  geography?: string;
  analysisPurpose?: string;
  timeHorizon?: string;
  webSearchUsed?: boolean;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function q(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildFrontmatter(industryName: string, date: string, meta?: DownloadMeta): string {
  const lines = ["---"];
  lines.push(`title: "${q(meta?.title ?? industryName + " 產業研究")}"`);
  lines.push(`industry: "${q(industryName)}"`);
  if (meta?.geography) lines.push(`geography: "${q(meta.geography)}"`);
  if (meta?.analysisPurpose) lines.push(`purpose: "${q(meta.analysisPurpose)}"`);
  if (meta?.timeHorizon) lines.push(`time_horizon: "${q(meta.timeHorizon)}"`);
  lines.push(`date: "${date}"`);
  if (meta?.webSearchUsed !== undefined) lines.push(`web_search: ${meta.webSearchUsed}`);
  lines.push("---", "");
  return lines.join("\n");
}

function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Strips ### Sources subsections and removes ## Supporting Facts & Data Gaps sections.
function makePresentationMarkdown(markdown: string): string {
  // Remove ### Sources subsections (up to next ### or ## or end of string)
  const withoutSubSources = markdown.replace(
    /\n### Sources[^\n]*\n[\s\S]*?(?=\n###|\n##|$)/g,
    "\n"
  );

  // Split on lines that start a new ## section (keep delimiter in the following part)
  const parts = withoutSubSources.split(/\n(?=## )/);

  const filtered = parts.filter((part) => {
    const h2 = part.match(/^## (.+)/m);
    if (!h2) return true;
    const title = h2[1];
    return (
      !title.includes("Supporting Facts") &&
      !title.includes("支撐資料") &&
      !title.includes("Data Gaps") &&
      !title.includes("資料缺口")
    );
  });

  return filtered.join("\n").trim();
}

export function downloadMarkdown(
  markdown: string,
  industryName: string,
  meta?: DownloadMeta
): void {
  const date = new Date().toISOString().split("T")[0];
  const safe = sanitizeFilename(industryName) || "industry";
  const filename = `${safe}-industry-analysis-report-${date}.md`;
  const content = buildFrontmatter(industryName, date, meta) + markdown;
  triggerDownload(content, filename);
}

export function downloadPresentationMarkdown(
  markdown: string,
  industryName: string,
  meta?: DownloadMeta
): void {
  const date = new Date().toISOString().split("T")[0];
  const safe = sanitizeFilename(industryName) || "industry";
  const filename = `${safe}-industry-analysis-ppt-${date}.md`;
  const content = buildFrontmatter(industryName, date, meta) + makePresentationMarkdown(markdown);
  triggerDownload(content, filename);
}
