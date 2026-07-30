import { describe, it, expect } from 'vitest';
import { invokeN8nWebhook } from '@/integrations/webhook-keywords';
import { invokeVercelGateway } from '@/integrations/Vercel-keywords';

const keywordPool = [
  'neuroscience, cognition, brain injury',
  'cancer immunology, tumor microenvironment',
  'climate change, marine biodiversity',
  'machine learning, explainable AI, healthcare',
  'social media, misinformation, digital ethics',
  'renewable energy, battery storage',
  'genomics, single-cell sequencing',
  'public health, epidemiology, vaccination',
  'robotics, human-robot interaction',
  'quantum computing, cryptography',
  'agri-tech, precision farming, crop resilience',
  'digital twins, aerospace engineering, simulation',
  'sustainable materials, circular economy, recycling',
  'urban mobility, traffic optimization, smart cities',
  'protein engineering, synthetic biology, biomanufacturing',
];

function getKeywordSamples(count = 10) {
  const pool = [...keywordPool];
  const samples = [];

  while (samples.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    samples.push(pool.splice(index, 1)[0]);
  }

  return samples;
}

function buildPrompt(keywords) {
  return `Research Details:\nAbstract: ${keywords}\nKeywords: ${keywords}\nResearch Aims: ${keywords}\nScope: ${keywords}`;
}

async function measure(fn, prompt, options = {}) {
  const startedAt = Date.now();
  try {
    const result = await fn({ prompt, ...options });
    const durationMs = Date.now() - startedAt;
    return { durationMs, result };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    return { durationMs, error: error?.message ?? String(error) };
  }
}

describe('keyword matching integration comparison', () => {
  it('compares n8n and Vercel for 10 random keyword examples', async () => {
    const keywordSamples = getKeywordSamples(10);
    const comparisons = [];

    for (const keywords of keywordSamples) {
      const prompt = buildPrompt(keywords);
      const [n8nResult, vercelResult] = await Promise.allSettled([
        measure(invokeN8nWebhook, prompt, { timeoutMs: 3000 }),
        measure(invokeVercelGateway, prompt),
      ]);

      const n8nOutcome = n8nResult.status === 'fulfilled'
        ? n8nResult.value
        : { durationMs: null, error: n8nResult.reason?.message ?? String(n8nResult.reason) };
      const vercelOutcome = vercelResult.status === 'fulfilled'
        ? vercelResult.value
        : { durationMs: null, error: vercelResult.reason?.message ?? String(vercelResult.reason) };

      comparisons.push({
        keywords,
        n8n: {
          durationMs: n8nOutcome.durationMs,
          result: n8nOutcome.result,
          error: n8nOutcome.error,
        },
        vercel: {
          durationMs: vercelOutcome.durationMs,
          result: vercelOutcome.result,
          error: vercelOutcome.error,
        },
      });
    }

    expect(comparisons).toHaveLength(keywordSamples.length);

    comparisons.forEach((comparison) => {
      expect(comparison.n8n).toBeDefined();
      expect(comparison.vercel).toBeDefined();
      expect(comparison.n8n.durationMs === null || Number.isFinite(comparison.n8n.durationMs)).toBe(true);
      expect(comparison.vercel.durationMs === null || Number.isFinite(comparison.vercel.durationMs)).toBe(true);
    });

    // Expose the comparison data in the test output for repeated manual runs.
    // eslint-disable-next-line no-console
    console.table(
      comparisons.map((comparison) => ({
        keywords: comparison.keywords,
        n8nDurationMs: comparison.n8n.durationMs,
        vercelDurationMs: comparison.vercel.durationMs,
        n8nMatches: JSON.stringify(comparison.n8n.result?.matches ?? []),
        vercelMatches: JSON.stringify(comparison.vercel.result?.matches ?? []),
        n8nError: comparison.n8n.error ?? '',
        vercelError: comparison.vercel.error ?? '',
      }))
    );
  }, 120000);
});
