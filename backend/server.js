import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

const GATEWAY_URL = process.env.VITE_AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1';
const API_KEY = process.env.VITE_AI_GATEWAY_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_AI_GATEWAY_API_KEY is not set in .env.local');
}

// Proxy endpoint for AI Gateway calls
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { model, messages, temperature, response_format } = req.body;

    const response = await fetch(`${GATEWAY_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        response_format,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `AI Gateway returned ${response.status}`,
        details: text,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Failed to call AI Gateway',
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
