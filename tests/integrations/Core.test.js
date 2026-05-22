import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('InvokeLLM', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn();
    vi.stubEnv('VITE_AI_GATEWAY_API_KEY', 'test-key');
    vi.stubEnv('VITE_AI_GATEWAY_URL', 'https://gateway.test/v1');
    vi.stubEnv('VITE_AI_GATEWAY_MODEL', 'test-model');
    // Force the module to be re-evaluated so it picks up the stubbed env.
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it('throws when prompt is missing or not a string', async () => {
    const { InvokeLLM } = await import('@/integrations/Core');

    await expect(InvokeLLM({})).rejects.toThrow(/prompt/i);
    await expect(InvokeLLM({ prompt: 42 })).rejects.toThrow(/prompt/i);
  });

  it('throws when API key is not set', async () => {
    vi.stubEnv('VITE_AI_GATEWAY_API_KEY', '');
    vi.resetModules();

    const { InvokeLLM } = await import('@/integrations/Core');

    await expect(InvokeLLM({ prompt: 'hi' })).rejects.toThrow(
      /VITE_AI_GATEWAY_API_KEY/
    );
  });

  it('posts to the gateway with json_object format when no schema is provided', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: '{"foo":"bar"}' } }],
        }),
    });

    const { InvokeLLM } = await import('@/integrations/Core');
    const result = await InvokeLLM({ prompt: 'ping' });

    expect(result).toEqual({ foo: 'bar' });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const [url, init] = globalThis.fetch.mock.calls[0];
    expect(url).toBe('https://gateway.test/v1/chat/completions');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer test-key');

    const body = JSON.parse(init.body);
    expect(body.model).toBe('test-model');
    expect(body.temperature).toBe(0.2);
    expect(body.response_format).toEqual({ type: 'json_object' });
    expect(body.messages).toHaveLength(2);
    expect(body.messages[1]).toEqual({ role: 'user', content: 'ping' });
  });

  it('uses json_schema response format when schema is provided', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: '{"ok":true}' } }],
        }),
    });

    const schema = {
      title: 'My Schema',
      type: 'object',
      properties: { ok: { type: 'boolean' } },
    };

    const { InvokeLLM } = await import('@/integrations/Core');
    await InvokeLLM({ prompt: 'p', response_json_schema: schema });

    const [, init] = globalThis.fetch.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.response_format).toEqual({
      type: 'json_schema',
      json_schema: {
        name: 'My Schema',
        schema,
        strict: false,
      },
    });
  });

  it('throws a descriptive error when the gateway responds non-ok', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: () => Promise.resolve('upstream is down'),
    });

    const { InvokeLLM } = await import('@/integrations/Core');
    await expect(InvokeLLM({ prompt: 'p' })).rejects.toThrow(/503/);
  });

  it('throws when message content is missing from the response', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: {} }] }),
    });

    const { InvokeLLM } = await import('@/integrations/Core');
    await expect(InvokeLLM({ prompt: 'p' })).rejects.toThrow(/missing/i);
  });

  it('throws when the model returns non-JSON content', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: 'not json at all' } }],
        }),
    });

    const { InvokeLLM } = await import('@/integrations/Core');
    await expect(InvokeLLM({ prompt: 'p' })).rejects.toThrow(/valid JSON/);
  });
});
