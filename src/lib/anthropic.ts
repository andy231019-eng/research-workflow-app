import Anthropic from "@anthropic-ai/sdk";

export function getAnthropicClient(apiKey?: string): Anthropic {
  const key = apiKey?.trim() || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "未設定 Anthropic API Key。請在表單頂部輸入你的 API Key，或在 .env.local 中設定 ANTHROPIC_API_KEY。"
    );
  }
  return new Anthropic({ apiKey: key });
}
