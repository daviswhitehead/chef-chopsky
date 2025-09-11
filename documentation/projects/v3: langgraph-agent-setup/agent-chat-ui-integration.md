## Agent Chat UI integration (LangChain)

Goal: Verify our `agent/` LangGraph deployment works end-to-end inside LangChain’s prebuilt Agent Chat UI, before deeper frontend integration.

Reference: LangChain Agent Chat UI repo (`https://github.com/langchain-ai/agent-chat-ui`).

### Tasks

1) Prepare environment and run LangGraph server
- Node 20+, npm
- Set `OPENAI_API_KEY` (and optional `LANGSMITH_API_KEY`)
- From `agent/`:
```bash
cd agent
npm install
npm run dev
# Healthcheck
curl http://localhost:2024/health | cat
```
- Confirm graphs in `agent/langgraph.json` expose `retrieval_graph` (used as assistant ID).

2) Use Agent Chat UI (hosted or local)

Option A — Hosted (preferred for speed):
- Open the hosted UI with query params that point to your local server:
  - `https://agentchat.vercel.app/?apiUrl=http://localhost:2024&assistantId=retrieval_graph`
- Optional params:
  - `threadId` for deep-linking to a thread UUID
  - `chatHistoryOpen=true` to open the history panel by default
- You’ll see the chat immediately. If you instead see the setup form, enter:
  - Deployment URL: `http://localhost:2024`
  - Assistant / Graph ID: `retrieval_graph`
  - LangSmith API Key: optional

Option B — Run locally (alternate): configured for our dev server
- Clone the UI in a sibling or separate directory:
```bash
git clone https://github.com/langchain-ai/agent-chat-ui
cd agent-chat-ui
npm install
```
- Create `.env` with the minimum variables:
```bash
cp .env.example .env
```
Edit `.env`:
```
NEXT_PUBLIC_API_URL=http://localhost:2024
NEXT_PUBLIC_ASSISTANT_ID=retrieval_graph
# Optional (only needed if your LangGraph server requires it):
# LANGSMITH_API_KEY=lsv2_...
```
- Start the UI:
```bash
npm run dev
```
- Open the UI (default `http://localhost:3000`), you should not see the setup screen if `.env` is set; otherwise enter values as in Option A.

3) Smoke test chat
- Send: “I have kale, tomatoes, and quinoa from my CSA. What should I cook?”
- Expect: coherent response that references ingredients; streaming tokens appear.
- Inspect events/logs: ensure `retrievedDocs` are present (memory retriever by default in tests) and an AI message returns.

4) Validation checklist
- Server health: `GET /health` returns 200
- Assistant ID matches `retrieval_graph`
- Responses contain ingredient mentions and length > 50 chars
- No console errors (CORS/WebSocket/API)

5) Troubleshooting
- Server not running: start from `agent/` with `npm run dev`
- Wrong assistant ID: confirm `agent/langgraph.json` and use `retrieval_graph`
- CORS/auth errors: for local dev, use `NEXT_PUBLIC_API_URL=http://localhost:2024`
- Missing model keys: ensure `OPENAI_API_KEY` (or configure models used in `configuration.ts`)
- Healthcheck failing: confirm port 2024 not in use (`lsof -i :2024`)

6) Commit docs and share quickstart
```bash
git add documentation/projects/v3: langgraph-agent-setup/agent-chat-ui-integration.md
git commit -m "docs: add Agent Chat UI integration checklist"
```

### Notes
- The UI can be configured entirely via `.env` to skip the setup form. See repo README for production proxy/auth options.
- For production, prefer the API passthrough approach described in the UI README and inject `LANGSMITH_API_KEY` server-side.


