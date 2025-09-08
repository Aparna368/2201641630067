import { v4 as uuidv4 } from 'uuid';
import { ShortUrl, ClickData } from './types';
import { logger } from './logger';

class InMemoryStorage {
  private urls: Map<string, ShortUrl> = new Map();
  private shortcodeToId: Map<string, string> = new Map();

  generateShortcode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createShortUrl(originalUrl: string, validity: number = 30, customShortcode?: string): Promise<ShortUrl> {
    await logger.info(`Creating short URL for: ${originalUrl}`, 'db', { originalUrl, validity, customShortcode });

    let shortcode = customShortcode;
    
    if (shortcode) {
      if (this.shortcodeToId.has(shortcode)) {
        await logger.warn(`Shortcode collision: ${shortcode}`, 'db', { shortcode });
        throw new Error('Shortcode already exists');
      }
    } else {
      do {
        shortcode = this.generateShortcode();
      } while (this.shortcodeToId.has(shortcode));
    }

    const id = uuidv4();
    const now = new Date();
    const expiry = new Date(now.getTime() + validity * 60 * 1000);

    const shortUrl: ShortUrl = {
      id,
      shortcode,
      originalUrl,
      createdAt: now,
      expiry,
      clicks: []
    };

    this.urls.set(id, shortUrl);
    this.shortcodeToId.set(shortcode, id);

    await logger.info(`Created short URL: ${shortcode} -> ${originalUrl}`, 'db', { 
      shortcode, 
      originalUrl, 
      id,
      expiry: expiry.toISOString()
    });
    return shortUrl;
  }

  async getShortUrl(shortcode: string): Promise<ShortUrl | null> {
    const id = this.shortcodeToId.get(shortcode);
    if (!id) {
      await logger.warn(`Shortcode not found: ${shortcode}`, 'db', { shortcode });
      return null;
    }

    const shortUrl = this.urls.get(id);
    if (!shortUrl) {
      await logger.warn(`URL not found for ID: ${id}`, 'db', { id, shortcode });
      return null;
    }

    if (shortUrl.expiry < new Date()) {
      await logger.warn(`Short URL expired: ${shortcode}`, 'db', { shortcode, expiry: shortUrl.expiry.toISOString() });
      this.urls.delete(id);
      this.shortcodeToId.delete(shortcode);
      return null;
    }

    return shortUrl;
  }

  async recordClick(shortcode: string, clickData: ClickData): Promise<void> {
    const id = this.shortcodeToId.get(shortcode);
    if (!id) return;

    const shortUrl = this.urls.get(id);
    if (!shortUrl) return;

    shortUrl.clicks.push(clickData);
    await logger.info(`Recorded click for shortcode: ${shortcode}`, 'db', { 
      shortcode, 
      clickData: {
        timestamp: clickData.timestamp,
        referrer: clickData.referrer,
        userAgent: clickData.userAgent,
        location: clickData.location
      }
    });
  }

  async getAllShortUrls(): Promise<ShortUrl[]> {
    const now = new Date();
    const validUrls: ShortUrl[] = [];
    
    for (const [id, url] of this.urls.entries()) {
      if (url.expiry > now) {
        validUrls.push(url);
      } else {
        // Clean up expired URLs
        this.urls.delete(id);
        this.shortcodeToId.delete(url.shortcode);
      }
    }

    return validUrls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getShortUrlStats(shortcode: string): Promise<ShortUrl | null> {
    return this.getShortUrl(shortcode);
  }
}

export const storage = new InMemoryStorage();
