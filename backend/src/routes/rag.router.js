'use strict';

const express = require('express');
const { httpRagAsk } = require('./rag.controller');

const ragRouter = express.Router();

// No auth middleware here, intentionally — this mirrors TAG WISE's own backend
// (tag-wise-be/src/app.js), which has zero request-level auth on any /v1/api/*
// route today (its "login" only gates which frontend route renders; the backend
// itself is fully open, and the frontend never attaches an Authorization header).
// Login is enforced client-side only (see frontend/src/auth/) — this endpoint is
// still reachable directly (curl/Postman) by anyone who has the URL, same as every
// TAG WISE backend endpoint is today.
ragRouter.post('/ask', httpRagAsk);

module.exports = ragRouter;
