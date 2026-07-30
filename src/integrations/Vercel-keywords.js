const DEFAULT_MODEL =
  import.meta.env.VITE_AI_GATEWAY_MODEL ?? "openai/gpt-4o-mini";
const DEFAULT_GATEWAY_URL =
  import.meta.env.VITE_AI_GATEWAY_URL ?? "https://ai-gateway.vercel.sh/v1";
const API_KEY = import.meta.env.VITE_AI_GATEWAY_API_KEY;

export async function invokeVercelGateway({
  prompt,
  response_json_schema,
  model = DEFAULT_MODEL,
  temperature = 0.2,
  signal,
} = {}) {
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

  const responseFormats = [];
  if (response_json_schema && typeof response_json_schema === "object") {
    responseFormats.push({
      type: "json_schema",
      json_schema: {
        name: response_json_schema.title ?? "response",
        schema: response_json_schema,
        strict: false,
      },
    });
  }
  responseFormats.push({ type: "json_object" });

  let lastError;
  for (const response_format of responseFormats) {
    const body = {
      model,
      messages,
      temperature,
      response_format,
    };

    try {
      const res = await fetch(`${DEFAULT_GATEWAY_URL}/chat/completions`, {
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
        lastError = new Error(
          `InvokeLLM: AI Gateway returned ${res.status}. ${text.slice(0, 500)}`
        );
        if (response_format.type === "json_schema") {
          const errorText = String(lastError.message).toLowerCase();
          if (errorText.includes("invalid") || errorText.includes("response_format")) {
            continue;
          }
        }
        throw lastError;
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
    } catch (error) {
      lastError = error;
      if (response_format.type === "json_schema") {
        const message = String(error?.message ?? "").toLowerCase();
        if (message.includes("invalid") || message.includes("response_format")) {
          continue;
        }
      }
      throw error;
    }
  }

  throw lastError;
}

export default invokeVercelGateway;

