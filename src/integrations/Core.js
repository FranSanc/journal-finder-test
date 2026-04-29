/**
 * Drop-in replacement for the base44 `InvokeLLM` integration.
 *
 * Original signature (base44):
 *   InvokeLLM({ prompt, response_json_schema }) -> Promise<object>
 *
 * This implementation calls Vercel's AI Gateway directly from the browser
 * (the gateway is OpenAI-compatible). The contract is unchanged, so existing
 * callers like `src/pages/JournalFinder.jsx` keep working.
 *
 * ⚠️  SECURITY NOTE
 * -----------------
 * Because this app is deployed to a purely static host (no backend), the
 * Vercel AI Gateway key has to be embedded in the client bundle via
 * `VITE_AI_GATEWAY_API_KEY`. That means anyone with browser DevTools can
 * read it and use it on their own. Treat the key as semi-public:
 *   - keep this app behind auth (SSO, network restriction, internal-only),
 *   - put a low spending cap on the key in the Vercel dashboard,
 *   - rotate the key if it ever leaks publicly.
 *
 * Env vars (all `VITE_*`, baked into dist/ at build time):
 *   - VITE_AI_GATEWAY_API_KEY   (required)
 *   - VITE_AI_GATEWAY_URL       (optional, default: https://ai-gateway.vercel.sh/v1)
 *   - VITE_AI_GATEWAY_MODEL     (optional, default: openai/gpt-4o-mini)
 */

const GATEWAY_URL =
  import.meta.env.VITE_AI_GATEWAY_URL ?? "https://ai-gateway.vercel.sh/v1";
const DEFAULT_MODEL =
  import.meta.env.VITE_AI_GATEWAY_MODEL ?? "openai/gpt-4o-mini";
const API_KEY = import.meta.env.VITE_AI_GATEWAY_API_KEY;

export async function InvokeLLM({
  prompt,
  response_json_schema,
  model = DEFAULT_MODEL,
  temperature = 0.2,
  signal,
} = {}) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("InvokeLLM: `prompt` is required and must be a string.");
  }
  if (!API_KEY) {
    throw new Error(
      "InvokeLLM: VITE_AI_GATEWAY_API_KEY is not set. Add it to .env.local and rebuild."
    );
  }

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant. When a JSON schema is provided, respond with a single JSON object that strictly conforms to it. Do not include any prose outside the JSON.",
    },
    { role: "user", content: prompt },
  ];

  const body = {
    model,
    messages,
    temperature,
  };

  if (response_json_schema && typeof response_json_schema === "object") {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: response_json_schema.title ?? "response",
        schema: response_json_schema,
        strict: false,
      },
    };
  } else {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${GATEWAY_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `InvokeLLM: AI Gateway returned ${res.status}. ${text.slice(0, 500)}`
    );
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("InvokeLLM: AI Gateway response missing message content.");
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error(
      "InvokeLLM: model did not return valid JSON. Raw content: " +
        content.slice(0, 500)
    );
  }
}

export default InvokeLLM;
