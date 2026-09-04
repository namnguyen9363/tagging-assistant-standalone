// Relative path so it works unchanged in both environments:
// - local dev: proxied to the backend by vite.config.ts's server.proxy
// - Vercel: routed to the backend function by the root vercel.json ("/api/*")
const API_BASE = "/api";

export interface RagAskResponse {
  answer: string;
  sources: { document: string; page: number }[];
}

export async function apiRagAsk(query: string): Promise<RagAskResponse> {
  const res = await fetch(`${API_BASE}/rag/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Request failed (${res.status})`);
  }

  return res.json();
}
