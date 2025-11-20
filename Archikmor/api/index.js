// Vercel Serverless Function Wrapper for ARCHIKMOR Express App
// This file allows the Express server to run as a Vercel serverless function

const app = require('../server/index.js');

// Vercel serverless function handler
// Vercel will call this function for all /api/* routes
module.exports = (req, res) => {
  // Remove the /api prefix from the path since Express routes already have it
  // Vercel routes /api/* to this function, but Express expects /api/* in the path
  // So we need to preserve the original path
  return app(req, res);
};

