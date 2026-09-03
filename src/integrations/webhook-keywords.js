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
const SCOPE_CLASSIFIER_WEBHOOK_URL =
  import.meta.env.VITE_N8N_SCOPE_CLASSIFIER_WEBHOOK_URL ??
  "https://n8n.frontiersin.io/webhook/scope-classifier";
const DEFAULT_TIMEOUT_MS = 30000;

function normalizeScopeClassifierResult(payload) {
  if (Array.isArray(payload)) {
    return { data: payload, metadata: null };
  }

  if (payload && typeof payload === "object" && Array.isArray(payload.data)) {
    return { data: payload.data, metadata: payload.metadata ?? null };
  }

  return { data: [], metadata: null };
}

async function invokeWebhook(url, body, signal, timeoutMs) {
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
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `InvokeLLM: n8n webhook returned ${res.status}. ${text.slice(0, 500)}`
      );
    }

    return await res.json().catch(() => null);
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", handleAbort);
    }
  }
}

export async function invokeScopeClassifier({ manuscript, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const payload = await invokeWebhook(
    SCOPE_CLASSIFIER_WEBHOOK_URL,
    {
      manuscript: {
        title: manuscript?.title ?? "",
        abstract: manuscript?.abstract ?? "",
      },
      selected_journal_id: 0,
      selected_section_id: 0,
      rt_suggestions: false,
    },
    signal,
    timeoutMs
  );

  return normalizeScopeClassifierResult(payload);
}

export async function invokeN8nWebhook({ prompt, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const keywords = extractKeywords(prompt);
  const payload = await invokeWebhook(
    N8N_WEBHOOK_URL,
    { keywords },
    signal,
    timeoutMs
  );
  return normalizeMatchesResult(payload);
}

export default invokeN8nWebhook;
