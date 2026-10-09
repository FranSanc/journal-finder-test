import { invokeN8nWebhook, invokeScopeClassifier } from "./webhook-keywords.js";
import { invokeVercelGateway } from "./Vercel-keywords.js";

const DEFAULT_MODEL =
  import.meta.env.VITE_AI_GATEWAY_MODEL ?? "openai/gpt-4o-mini";
const N8N_TIMEOUT_MS = 30000;

export async function InvokeLLM({
  prompt,
  response_json_schema,
  model = DEFAULT_MODEL,
  temperature = 0.2,
  signal,
  searchMode = "keywords",
  manuscript,
} = {}) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("InvokeLLM: `prompt` is required and must be a string.");
  }

  try {
    if (searchMode === "abstract") {
      return await invokeScopeClassifier({ manuscript, signal, timeoutMs: N8N_TIMEOUT_MS });
    }

    return await invokeN8nWebhook({ prompt, signal, timeoutMs: N8N_TIMEOUT_MS });
  } catch (error) {
    const isTimeout =
      error?.name === "AbortError" ||
      /timed out|aborted/i.test(error?.message || "");

    if (isTimeout) {
      return invokeVercelGateway({
        prompt,
        response_json_schema,
        model,
        temperature,
        signal,
      });
    }

    return invokeVercelGateway({
      prompt,
      response_json_schema,
      model,
      temperature,
      signal,
    });
  }
}

export default InvokeLLM;
