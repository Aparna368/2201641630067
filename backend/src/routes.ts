import express from 'express';
import { storage } from './storage';
import { logger } from './logger';
import { validateShortUrlRequest } from './validation';
import { ShortUrlRequest, ShortUrlResponse, ShortUrlStats } from './types';

const router = express.Router();

// Create short URL
router.post('/shorturls', async (req, res) => {
  try {
    await logger.info('POST /shorturls - Creating short URL', 'route', { body: req.body });

    const validation = await validateShortUrlRequest(req.body);
    if (!validation.isValid) {
      await logger.warn('Validation failed', 'route', { errors: validation.errors });
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { url, validity = 30, shortcode }: ShortUrlRequest = req.body;

    const shortUrl = await storage.createShortUrl(url, validity, shortcode);

    const response: ShortUrlResponse = {
      shortlink: `${req.protocol}://${req.get('host')}/${shortUrl.shortcode}`,
      expiry: shortUrl.expiry.toISOString()
    };

    await logger.info(`Successfully created short URL: ${response.shortlink}`, 'route', { 
      shortlink: response.shortlink,
      shortcode: shortUrl.shortcode
    });
    res.status(201).json(response);

  } catch (error: any) {
    await logger.error(`Error creating short URL: ${error.message}`, 'route', { 
      error: error.message,
      stack: error.stack
    });
    
    if (error.message === 'Shortcode already exists') {
      return res.status(409).json({
        error: 'Shortcode already exists',
        message: 'The provided shortcode is already in use'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create short URL'
    });
  }
});

// Get short URL statistics
router.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    await logger.info(`GET /shorturls/${shortcode} - Getting statistics`, 'route', { shortcode });

    const shortUrl = await storage.getShortUrlStats(shortcode);
    
    if (!shortUrl) {
      await logger.warn(`Short URL not found: ${shortcode}`, 'route', { shortcode });
      return res.status(404).json({
        error: 'Short URL not found',
        message: 'The requested short URL does not exist or has expired'
      });
    }

    const stats: ShortUrlStats = {
      shortcode: shortUrl.shortcode,
      originalUrl: shortUrl.originalUrl,
      shortlink: `${req.protocol}://${req.get('host')}/${shortUrl.shortcode}`,
      createdAt: shortUrl.createdAt.toISOString(),
      expiry: shortUrl.expiry.toISOString(),
      clickCount: shortUrl.clicks.length,
      clicks: shortUrl.clicks
    };

    await logger.info(`Retrieved statistics for shortcode: ${shortcode}`, 'route', { 
      shortcode,
      clickCount: shortUrl.clicks.length
    });
    res.json(stats);

  } catch (error: any) {
    await logger.error(`Error getting statistics: ${error.message}`, 'route', { 
      shortcode: req.params.shortcode,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve statistics'
    });
  }
});

// Get all short URLs (for frontend)
router.get('/shorturls', async (req, res) => {
  try {
    await logger.info('GET /shorturls - Getting all short URLs', 'route');

    const shortUrls = await storage.getAllShortUrls();
    
    const stats = shortUrls.map(url => ({
      shortcode: url.shortcode,
      originalUrl: url.originalUrl,
      shortlink: `${req.protocol}://${req.get('host')}/${url.shortcode}`,
      createdAt: url.createdAt.toISOString(),
      expiry: url.expiry.toISOString(),
      clickCount: url.clicks.length,
      clicks: url.clicks
    }));

    await logger.info(`Retrieved ${stats.length} short URLs`, 'route', { count: stats.length });
    res.json(stats);

  } catch (error: any) {
    await logger.error(`Error getting all short URLs: ${error.message}`, 'route', { 
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve short URLs'
    });
  }
});

export default router;
