'use strict';

const axios = require('axios');
const { searchKnowledgeBase } = require('../utils/ragSearch');

const SYSTEM_PROMPT = `You are a tagging support assistant for the Samsung eStore D2C team, answering as if chatting directly with a colleague. Answer ONLY using the content provided in the context. Answer naturally and directly, like messaging a coworker - skip openers like 'Based on the provided context...'. Merge overlapping or duplicate information instead of repeating it. When multiple sources cover the same topic, prioritize the official policy/guide document first - use ticket examples only to illustrate real application if helpful. If sources conflict, call that out explicitly. Lay out multi-step or multi-point answers clearly with bullets or numbers. If the context doesn't clearly or fully answer the question, say so plainly and recommend opening a JIRA ticket for further help - never guess or invent process details. Always cite your source(s) at the end of the answer in this format: Source: [document name], page [number].`;

const NO_MATCH_ANSWER = 'No relevant information found in the knowledge base. Please open a JIRA ticket for support.';

function buildContext(matches) {
  return matches
    .map(({ chunk }) => `[${chunk.doc_family} — page ${chunk.page_number}]\n${chunk.content}`)
    .join('\n\n---\n\n');
}

// Dedupe (document, page) pairs, keeping the highest-scoring occurrence first.
function buildSources(matches) {
  const seen = new Set();
  const sources = [];
  matches.forEach(({ chunk }) => {
    const key = `${chunk.doc_family}::${chunk.page_number}`;
    if (seen.has(key)) return;
    seen.add(key);
    sources.push({ document: chunk.doc_family, page: chunk.page_number });
  });
  return sources;
}

async function callDatabricks(query, context) {
  const workspaceUrl = (process.env.DATABRICKS_WORKSPACE_URL || '').replace(/\/+$/, '');
  const token = process.env.DATABRICKS_TOKEN;

  if (!workspaceUrl || !token) {
    throw new Error('DATABRICKS_WORKSPACE_URL / DATABRICKS_TOKEN is not set in .env');
  }

  const url = `${workspaceUrl}/serving-endpoints/databricks-meta-llama-3-3-70b-instruct/invocations`;

  const { data } = await axios.post(
    url,
    {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` },
      ],
      max_tokens: 1200,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function httpRagAsk(req, res) {
  const { query } = req.body || {};

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'query is required' });
  }

  const matches = searchKnowledgeBase(query);

  if (matches.length === 0) {
    return res.status(200).json({ answer: NO_MATCH_ANSWER, sources: [] });
  }

  try {
    const context = buildContext(matches);
    const answer = await callDatabricks(query.trim(), context);
    const sources = buildSources(matches);
    return res.status(200).json({ answer, sources });
  } catch (err) {
    console.error('[RAG] ask failed:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to generate answer from Databricks' });
  }
}

module.exports = { httpRagAsk };
