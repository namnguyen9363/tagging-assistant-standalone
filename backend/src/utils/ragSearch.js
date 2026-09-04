'use strict';

const fs = require('fs');
const path = require('path');

const KB_PATH = path.join(__dirname, '../../data/knowledge_base.json');
const TOP_N = 8;

// Common stopwords stripped before keyword matching — keeps the search
// focused on the meaningful/domain words of the question.
const STOPWORDS = new Set([
  'what', 'is', 'the', 'a', 'of', 'for', 'to', 'in', 'on', 'new', 'update',
  'code', 'and', 'or', 'how', 'do', 'does', 'i', 'can', 'you', 'please',
  'want', 'it', 'this', 'that', 'with',
]);

// Loaded once, at module load time (i.e. app/function cold-start) — never
// re-read on a per-request basis.
let knowledgeBase = [];
try {
  const raw = fs.readFileSync(KB_PATH, 'utf-8');
  knowledgeBase = JSON.parse(raw);
  console.log(`[RAG] Loaded ${knowledgeBase.length} chunks from knowledge_base.json`);
} catch (err) {
  console.error('[RAG] Failed to load knowledge_base.json:', err.message);
  knowledgeBase = [];
}

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (word) => !STOPWORDS.has(word),
  );
}

/**
 * Keyword search over the in-memory knowledge base.
 * score = (number of distinct query keywords found in the chunk) / (total distinct query keywords)
 * Returns the top `topN` chunks with score > 0, sorted highest score first.
 */
function searchKnowledgeBase(query, topN = TOP_N) {
  const keywords = [...new Set(tokenize(query || ''))];
  if (keywords.length === 0) return [];

  const scored = knowledgeBase.map((chunk) => {
    const content = (chunk.content || '').toLowerCase();
    const matchedCount = keywords.filter((kw) => content.includes(kw)).length;
    return { chunk, score: matchedCount / keywords.length };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

module.exports = {
  searchKnowledgeBase,
  getKnowledgeBaseSize: () => knowledgeBase.length,
};
