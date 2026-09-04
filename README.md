# Tagging Assistant (standalone)

Standalone deploy of the TAG WISE **Tagging Assistant** chat page — a
keyword-search RAG chatbot over `knowledge_base.json`, answered by a
Databricks Model Serving endpoint (Llama 3.3 70B). Fully independent from
the main TAG WISE app: no shared router, layout, auth, or state.

```
tagging-assistant-standalone/
├── frontend/   React + Vite + TS chat UI (same look as in TAG WISE)
├── backend/    Express API — POST /api/rag/ask
└── vercel.json Routes /api/* to the backend, everything else to the frontend build
```

## 1. Run locally

**Backend** (port 4000 by default):

```bash
cd backend
npm install
cp .env.example .env
# edit .env and fill in DATABRICKS_WORKSPACE_URL and DATABRICKS_TOKEN
npm run dev
```

Verify it's up:

```bash
curl -X POST http://localhost:4000/api/rag/ask \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the rule naming policy?"}'
```

**Frontend** (port 5174, in a second terminal):

```bash
cd frontend
npm install
cp .env.example .env
# edit .env and fill in VITE_AUTH0_DOMAIN_ID, VITE_AUTH0_CLIENT_ID,
# VITE_AUTH0_REDIRECT_URI (must be http://localhost:5174 for local dev — see
# .env.example for details on reusing vs. creating a separate Auth0 Application)
npm start
```

Open http://localhost:5174 — the dev server proxies `/api/*` requests to
`http://localhost:4000` automatically (see `frontend/vite.config.ts`), so no
extra frontend env var is needed for the API. The chat itself is gated behind
Auth0 login (`src/auth/`); without a valid `.env` the app renders a blank
page (`Auth0Provider` returns `null` when any of the 3 vars is missing).

## 2. Deploy to Vercel

1. Push this `tagging-assistant-standalone/` folder as its **own** Git repo
   (separate from the main TAG WISE repo):
   ```bash
   cd tagging-assistant-standalone
   git init
   git add .
   git commit -m "Tagging Assistant standalone"
   gh repo create your-org/tagging-assistant-standalone --private --source=. --push
   # or create the repo on GitHub first, then:
   # git remote add origin <repo-url> && git push -u origin main
   ```
2. On [vercel.com](https://vercel.com) → **Add New... → Project** → import
   that repo. Vercel will read `vercel.json` at the repo root and build both
   the frontend (static) and backend (serverless function) in one project —
   no extra configuration needed in the dashboard.
3. Before the first deploy (or right after, then redeploy), go to
   **Project Settings → Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `DATABRICKS_WORKSPACE_URL` | e.g. `https://adb-xxxxxxxxxxxx.xx.azuredatabricks.net` (no trailing slash) |
   | `DATABRICKS_TOKEN` | your Databricks personal access token (`dapi...`), with **Can Query** on the `databricks-meta-llama-3-3-70b-instruct` serving endpoint |
   | `VITE_AUTH0_DOMAIN_ID` | your Auth0 tenant domain, e.g. `dev-xxxxxxxx.us.auth0.com` |
   | `VITE_AUTH0_CLIENT_ID` | the Auth0 Application's Client ID |
   | `VITE_AUTH0_REDIRECT_URI` | the deployed app's own URL, e.g. `https://your-project.vercel.app` (no trailing slash) |

   The `VITE_*` vars are baked into the static frontend bundle at **build**
   time (Vite), so they must be set before the build runs, not just at
   runtime — set them, then deploy (or redeploy if set after the first
   deploy, same as the Databricks vars).

   In the Auth0 Dashboard, on that Application's Settings page, add the
   deployed URL to **Allowed Callback URLs**, **Allowed Web Origins**, and
   **Allowed Logout URLs** — otherwise login fails with "Callback URL
   mismatch" once deployed, same as it would locally without
   `http://localhost:5174` allow-listed.

4. Deploy. The frontend is served at the project's root URL, and it calls
   `/api/rag/ask` on the same domain — no CORS setup, no separate backend
   URL to configure anywhere in the frontend.

### Updating `knowledge_base.json`

Replace `backend/data/knowledge_base.json` and redeploy — it's loaded into
memory once per serverless cold start, not re-read per request.
