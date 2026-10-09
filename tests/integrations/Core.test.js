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

  it.each([
    ['array payload', [{ journal_title: 'Journal A' }], [{ journal_title: 'Journal A' }]],
    ['results payload', { results: [{ journal_title: 'Journal B' }] }, [{ journal_title: 'Journal B' }]],
    ['journals payload', { journals: [{ journal_title: 'Journal C' }] }, [{ journal_title: 'Journal C' }]],
    ['single journal payload', { journal_title: 'Journal D' }, [{ journal_title: 'Journal D' }]],
    ['unrecognized payload', { unexpected: true }, []],
  ])('normalizes the n8n %s', async (_description, payload, matches) => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const { invokeN8nWebhook } = await import('@/integrations/webhook-keywords');
    await expect(invokeN8nWebhook({ prompt: 'Keywords: one; two' })).resolves.toEqual({ matches });
  });

  it('retries the Vercel gateway with JSON mode when schema format is rejected', async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('invalid response_format'),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '{"matches":[]}' } }],
        }),
      });

    const { invokeVercelGateway } = await import('@/integrations/Vercel-keywords');
    const result = await invokeVercelGateway({
      prompt: 'Keywords: neuroscience',
      response_json_schema: { title: 'matches', type: 'object' },
    });

    expect(result).toEqual({ matches: [] });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(globalThis.fetch.mock.calls[0][1].body).response_format.type).toBe('json_schema');
    expect(JSON.parse(globalThis.fetch.mock.calls[1][1].body).response_format.type).toBe('json_object');
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
