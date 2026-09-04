'use strict';

// Vercel Function for GET /api/health — reuses the same Express app as
// local dev (backend/src/app.js). One explicit file per endpoint instead
// of a [...catch-all].js: the bracket dynamic-segment convention is a
// Next.js file-system-router feature, not guaranteed for plain (non-Next)
// Vercel Functions, and it silently fell through to the SPA rewrite
// fallback (requests to /api/* returned index.html instead of JSON).
module.exports = require('../backend/src/app.js');
