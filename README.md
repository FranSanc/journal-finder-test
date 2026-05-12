# Journal Finder Test

## About

This project is a Vite + React journal finder app. It helps match research abstracts to suitable Frontiers journal options using a local AI gateway proxy.

## Getting Started

1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies:
   - `npm install`
4. Start the app:
   - `npm run dev`
5. Open `http://localhost:3001` in your browser.

## Build & Preview

- Build for production: `npm run build`
- Preview the production build: `npm run preview`

## Environment

The app uses environment variables from `.env.local`.

At minimum configure:

- `VITE_AI_GATEWAY_API_KEY` — your Vercel AI Gateway key
- `VITE_AI_GATEWAY_URL` — optional, defaults to `https://ai-gateway.vercel.sh/v1`
- `VITE_AI_GATEWAY_MODEL` — optional, defaults to `openai/gpt-4o-mini`

Example `.env.local` values:

```env
VITE_AI_GATEWAY_API_KEY=vck_...
VITE_AI_GATEWAY_URL=https://ai-gateway.vercel.sh/v1
VITE_AI_GATEWAY_MODEL=openai/gpt-4o-mini
```

## App Architecture

This repository now runs as a single application:

- `server.js` serves the React frontend and the `/api/ai/chat` backend endpoint
- `npm run dev` runs the unified development server
- `npm run preview` serves the built production site from `dist`

There is no separate frontend/backend process required anymore.
