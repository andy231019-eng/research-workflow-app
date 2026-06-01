const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicMessageResponse = {
  content?: Array<AnthropicTextBlock | { type: string; [key: string]: unknown }>;
};

type AnthropicErrorOptions = {
  status?: number;
  responseText?: string;
  cause?: unknown;
};

export class AnthropicApiError extends Error {
  status?: number;
  responseText?: string;
  cause?: unknown;

  constructor(message: string, options: AnthropicErrorOptions = {}) {
    super(message);
    this.name = "AnthropicApiError";
    this.status = options.status;
    this.responseText = options.responseText;
    this.cause = options.cause;
  }
}

export function resolveAnthropicApiKey(apiKey?: string): string {
  const key = sanitizeAnthropicApiKey(apiKey || process.env.ANTHROPIC_API_KEY || "");
  if (!key) {
    throw new Error(
      "未設定 Anthropic API Key。請在表單頂部輸入你的 API Key，或在 .env.local 中設定 ANTHROPIC_API_KEY。"
    );
  }
  if (!key.startsWith("sk-ant-")) {
    throw new Error("API Key 格式不像 Anthropic API Key。請確認你輸入的是 console.anthropic.com 產生的 sk-ant-... key。");
  }
  return key;
}

export function getApiKeyDiagnostics(apiKey?: string): Record<string, unknown> {
  const raw = apiKey || "";
  const sanitized = sanitizeAnthropicApiKey(raw);
  return {
    providedInBody: Boolean(raw),
    rawLength: raw.length,
    sanitizedLength: sanitized.length,
    removedWhitespace: raw.length - sanitized.length,
    looksLikeAnthropicKey: sanitized.startsWith("sk-ant-"),
  };
}

export function formatAnthropicError(err: unknown): string {
  if (err instanceof AnthropicApiError) {
    const detail = extractAnthropicErrorMessage(err.responseText);
    if (err.status === 401) {
      return "Anthropic API 認證失敗（401）。請重新貼上 API Key，確認它是有效的 sk-ant-... key，且沒有被撤銷。" + detail;
    }
    if (err.status === 403) {
      return "Anthropic API 權限不足（403）。請確認此帳號有 Claude API、指定模型或工具使用權限。" + detail;
    }
    if (err.status === 429) {
      return "Anthropic API 額度或速率限制（429）。請確認帳號額度、billing 與 rate limit。" + detail;
    }
    if (err.status && err.status >= 500) {
      return "Anthropic API 服務暫時失敗（" + err.status + "）。請稍後重試。" + detail;
    }
    if (err.status) {
      return "Anthropic API 呼叫失敗（" + err.status + "）。" + detail;
    }
  }

  return err instanceof Error ? err.message : "Unknown error";
}

export function isRetryableGenerationError(err: unknown): boolean {
  return !(err instanceof AnthropicApiError) || !err.status || err.status >= 500;
}

export function isWebSearchToolError(err: unknown): boolean {
  if (!(err instanceof AnthropicApiError)) return false;
  if (err.status !== 400 && err.status !== 403) return false;
  const text = (err.responseText || err.message).toLowerCase();
  return text.includes("web_search") || text.includes("tool");
}

export async function createAnthropicMessage<TBody extends Record<string, unknown>>(
  apiKey: string,
  body: TBody
): Promise<AnthropicMessageResponse> {
  let res: Response;
  try {
    res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: makeAnthropicHeaders(apiKey),
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw makeAnthropicTransportError(err);
  }

  if (!res.ok) {
    throw await makeAnthropicApiError(res);
  }

  return parseAnthropicJsonResponse<AnthropicMessageResponse>(await res.text(), res.status);
}

export async function streamAnthropicText<TBody extends Record<string, unknown>>(
  apiKey: string,
  body: TBody,
  onChunk?: (text: string) => void
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: makeAnthropicHeaders(apiKey),
      body: JSON.stringify({ ...body, stream: true }),
    });
  } catch (err) {
    throw makeAnthropicTransportError(err);
  }

  if (!res.ok) {
    throw await makeAnthropicApiError(res);
  }
  if (!res.body) {
    throw new AnthropicApiError("Anthropic streaming response did not include a body", {
      status: res.status,
    });
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      const text = parseAnthropicSseTextDelta(event);
      if (text) {
        fullText += text;
        onChunk?.(text);
      }
      const error = parseAnthropicSseError(event);
      if (error) {
        throw new AnthropicApiError(error);
      }
    }
  }

  return fullText;
}

export function getFirstTextBlock(message: AnthropicMessageResponse): string {
  const text = message.content?.find((block): block is AnthropicTextBlock => block.type === "text");
  if (!text?.text) {
    throw new AnthropicApiError("Anthropic response did not contain a text block");
  }
  return text.text;
}

function makeAnthropicHeaders(apiKey: string): HeadersInit {
  return {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
  };
}

function sanitizeAnthropicApiKey(raw: string): string {
  return raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[\s\u200B-\u200D\uFEFF]/g, "");
}

function makeAnthropicTransportError(err: unknown): AnthropicApiError {
  const name = err instanceof Error ? err.name : "UnknownError";
  const message = err instanceof Error ? err.message : "Unknown transport error";
  return new AnthropicApiError(
    "Anthropic API request could not be sent. Transport error " + name + ": " + message,
    { cause: err }
  );
}

async function makeAnthropicApiError(res: Response): Promise<AnthropicApiError> {
  const responseText = await res.text().catch(() => "");
  return new AnthropicApiError(res.statusText || "Anthropic API request failed", {
    status: res.status,
    responseText,
  });
}

function parseAnthropicJsonResponse<T>(responseText: string, status: number): T {
  if (!responseText.trim()) {
    throw new AnthropicApiError("Anthropic API returned an empty response body", {
      status,
      responseText,
    });
  }

  try {
    return JSON.parse(responseText) as T;
  } catch (err) {
    throw new AnthropicApiError(
      "Anthropic API returned non-JSON response. Preview: " + responseText.slice(0, 300),
      {
        status,
        responseText,
        cause: err,
      }
    );
  }
}

function extractAnthropicErrorMessage(responseText?: string): string {
  if (!responseText) return "";
  try {
    const parsed = JSON.parse(responseText) as { error?: { message?: string } };
    return parsed.error?.message ? " 詳細：" + parsed.error.message : "";
  } catch {
    return " 詳細：" + responseText.slice(0, 300);
  }
}

function parseAnthropicSseTextDelta(event: string): string {
  const data = getSseData(event);
  if (!data) return "";
  try {
    const parsed = JSON.parse(data) as {
      type?: string;
      delta?: { type?: string; text?: string };
    };
    if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
      return parsed.delta.text || "";
    }
  } catch {
    return "";
  }
  return "";
}

function parseAnthropicSseError(event: string): string {
  const data = getSseData(event);
  if (!data) return "";
  try {
    const parsed = JSON.parse(data) as {
      type?: string;
      error?: { message?: string };
    };
    if (parsed.type === "error") return parsed.error?.message || "Anthropic stream error";
  } catch {
    return "";
  }
  return "";
}

function getSseData(event: string): string {
  return event
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");
}
