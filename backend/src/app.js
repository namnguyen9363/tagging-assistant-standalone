'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ragRouter = require('./routes/rag.router');

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mounted at /api/rag so the same path (/api/rag/ask) works both locally
// (app.listen) and on Vercel, where the serverless function receives the
// original request path unchanged.
app.use('/api/rag', ragRouter);

module.exports = app;
