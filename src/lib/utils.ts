export function generateId(): string {
  return `page_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function tryParseJson<T>(raw: string): T | null {
  try {
    // Primary: extract from <json>...</json> tags (robust against markdown code blocks)
    const tagMatch = raw.match(/<json>([\s\S]*?)<\/json>/);
    if (tagMatch) return JSON.parse(tagMatch[1].trim()) as T;

    // Fallback: find outermost { ... } by index (avoids greedy regex issues)
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) return null;
    return JSON.parse(raw.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
