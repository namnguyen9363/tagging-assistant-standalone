'use strict';

// Vercel Function for POST /api/rag/ask — see api/health.js for why this
// is an explicit per-endpoint file rather than a [...catch-all].js.
module.exports = require('../../backend/src/app.js');
