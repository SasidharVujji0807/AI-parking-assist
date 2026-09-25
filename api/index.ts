// Vercel Serverless Function — handles all /api/* routes
// This wraps the Express application for Vercel's Node.js runtime

import type { VercelRequest, VercelResponse } from '@vercel/node';

// We need to re-export the express app as a serverless function
// Import the compiled server app
let appHandler: any;

async function getApp() {
  if (!appHandler) {
    // Dynamic import to avoid circular dependencies at cold start
    const { default: app } = await import('../server/src/app');
    appHandler = app;
  }
  return appHandler;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  return app(req, res);
}
