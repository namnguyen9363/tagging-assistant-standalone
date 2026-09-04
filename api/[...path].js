'use strict';

// Zero-config Vercel Function: any request under /api/* is routed here
// (catch-all filesystem route) and handled by the same Express app used
// for local dev (backend/src/app.js) — same routes, same req.url path,
// no duplication.
module.exports = require('../backend/src/app.js');
