import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('InvokeLLM', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn();
    vi.stubEnv('VITE_AI_GATEWAY_API_KEY', 'test-key');
    vi.stubEnv('VITE_AI_GATEWAY_URL', 'https://gateway.test/v1');
    vi.stubEnv('VITE_AI_GATEWAY_MODEL', 'test-model');
    vi.stubEnv('VITE_N8N_WEBHOOK_URL', 'https://n8n.test/webhook');
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it('throws when prompt is missing or not a string', async () => {
    const { InvokeLLM } = await import('@/integrations/keywordMatcher');

    await expect(InvokeLLM({})).rejects.toThrow(/prompt/i);
    await expect(InvokeLLM({ prompt: 42 })).rejects.toThrow(/prompt/i);
  });

  it('tries the n8n webhook first and returns its normalized matches', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          matches: [{ journal_title: 'Frontiers in Neuroscience', matching_score: 88 }],
        }),
    });

    const { InvokeLLM } = await import('@/integrations/keywordMatcher');
    const result = await InvokeLLM({ prompt: 'Keywords: neuroscience, cognition' });

    expect(result).toEqual({
      matches: [{ journal_title: 'Frontiers in Neuroscience', matching_score: 88 }],
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const [url, init] = globalThis.fetch.mock.calls[0];
    expect(url).toBe('https://n8n.test/webhook');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ keywords: ['neuroscience', 'cognition'] });
  });

  it('falls back to the Vercel gateway when the n8n webhook times out', async () => {
    globalThis.fetch
      .mockRejectedValueOnce(Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' }))
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: '{"matches":[{"journal_title":"Frontiers in Medicine"}]}' } }],
          }),
      });

    const { InvokeLLM } = await import('@/integrations/keywordMatcher');
    const result = await InvokeLLM({ prompt: 'Keywords: medicine' });

    expect(result).toEqual({
      matches: [{ journal_title: 'Frontiers in Medicine' }],
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    const [, vercelInit] = globalThis.fetch.mock.calls[1];
    expect(vercelInit.headers.Authorization).toBe('Bearer test-key');
    expect(JSON.parse(vercelInit.body).messages[1]).toEqual({ role: 'user', content: 'Keywords: medicine' });
  });

  it('throws when API key is not set and the n8n webhook fails', async () => {
    vi.stubEnv('VITE_AI_GATEWAY_API_KEY', '');
    vi.resetModules();
    globalThis.fetch.mockRejectedValueOnce(Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' }));

    const { InvokeLLM } = await import('@/integrations/keywordMatcher');

    await expect(InvokeLLM({ prompt: 'hi' })).rejects.toThrow(
      /VITE_AI_GATEWAY_API_KEY/
    );
  });
});
