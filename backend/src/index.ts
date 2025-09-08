import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { logger } from './logger';
import { storage } from './storage';
import { ClickData } from './types';

const app = express();
const PORT = 5000;
const HOST = 'localhost';

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(async (req, res, next) => {
  await logger.info(`${req.method} ${req.path}`, 'handler', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  next();
});

// Health check endpoint (must come before shortcode route)
app.get('/health', async (req, res) => {
  await logger.info('Health check requested', 'handler');
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/', routes);

// Redirect route for short URLs
app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    await logger.info(`Redirect request for shortcode: ${shortcode}`, 'handler', { shortcode });

    const shortUrl = await storage.getShortUrl(shortcode);
    
    if (!shortUrl) {
      await logger.warn(`Short URL not found for redirect: ${shortcode}`, 'handler', { shortcode });
      return res.status(404).json({
        error: 'Short URL not found',
        message: 'The requested short URL does not exist or has expired'
      });
    }

    // Record click
    const clickData: ClickData = {
      timestamp: new Date().toISOString(),
      referrer: req.get('Referer') || undefined,
      userAgent: req.get('User-Agent') || undefined,
      location: req.get('X-Forwarded-For') || req.ip || 'Unknown'
    };

    await storage.recordClick(shortcode, clickData);
    await logger.info(`Redirecting ${shortcode} to ${shortUrl.originalUrl}`, 'handler', { 
      shortcode, 
      originalUrl: shortUrl.originalUrl 
    });

    res.redirect(302, shortUrl.originalUrl);

  } catch (error: any) {
    await logger.error(`Error handling redirect: ${error.message}`, 'handler', { 
      shortcode: req.params.shortcode,
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process redirect'
    });
  }
});


// Error handling middleware
app.use(async (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  await logger.error(`Unhandled error: ${error.message}`, 'handler', { 
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path
  });
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use(async (req, res) => {
  await logger.warn(`404 - Route not found: ${req.method} ${req.path}`, 'handler', { 
    method: req.method,
    path: req.path
  });
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

// Start server
app.listen(PORT, HOST, async () => {
  await logger.info(`URL Shortener Backend started on http://${HOST}:${PORT}`, 'config', { 
    host: HOST,
    port: PORT
  });
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

export default app;
