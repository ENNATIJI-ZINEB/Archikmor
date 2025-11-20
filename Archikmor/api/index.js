// Vercel Serverless Function Wrapper for ARCHIKMOR Express App
// This file allows the Express server to run as a Vercel serverless function

const app = require('../server/index.js');

// Vercel serverless function handler
// Vercel automatically routes /api/* requests to this function
// The Express app already has routes defined with /api/* prefix, so we just pass through
module.exports = app;

