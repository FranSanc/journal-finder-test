function extractKeywords(prompt) {
  if (typeof prompt !== "string") {
    return [];
  }

  const keywordsMatch = prompt.match(/Keywords:\s*([^\n]+)/i);
  if (keywordsMatch?.[1]) {
    return keywordsMatch[1]
      .split(/[,;\n]+/)
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeMatchesResult(payload) {
  if (Array.isArray(payload)) {
    return { matches: payload };
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.matches)) {
      return { matches: payload.matches };
    }

    if (Array.isArray(payload.results)) {
      return { matches: payload.results };
    }

    if (Array.isArray(payload.journals)) {
      return { matches: payload.journals };
    }

    if (
      payload.journal_title ||
      payload.matching_score ||
      payload.relevance_explanation ||
      payload.key_matches ||
      payload.submission_recommendation
    ) {
      return { matches: [payload] };
    }
  }

  return { matches: [] };
}

const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL ??
  "https://n8n.frontiersin.io/webhook/match-journal-bq";
const DEFAULT_TIMEOUT_MS = 30000;

export async function invokeN8nWebhook({ prompt, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const keywords = extractKeywords(prompt);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const handleAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", handleAbort, { once: true });
    }
  }

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keywords }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `InvokeLLM: n8n webhook returned ${res.status}. ${text.slice(0, 500)}`
      );
    }

    const payload = await res.json().catch(() => null);
    return normalizeMatchesResult(payload);
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", handleAbort);
    }
  }
}

export default invokeN8nWebhook;
