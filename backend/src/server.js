'use strict';

const app = require('./app');

const PORT = process.env.PORT || 4000;

// On Vercel this file is imported by the serverless runtime as a request
// handler (module.exports = app below) — it must NOT call app.listen().
// Locally (npm start / npm run dev) it runs as a normal long-lived server.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[tagging-assistant-backend] Listening on port ${PORT}...`);
  });
}

module.exports = app;
