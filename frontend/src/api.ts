import axios from 'axios';
import { ShortUrlRequest, ShortUrlResponse, ShortUrlStats } from './types';
import { logger } from './logger';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  async (config) => {
    await logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 'api', {
      method: config.method,
      url: config.url,
      data: config.data
    });
    return config;
  },
  async (error) => {
    await logger.error(`API Request Error: ${error.message}`, 'api', { 
      error: error.message,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  async (response) => {
    await logger.info(`API Response: ${response.status} ${response.config.url}`, 'api', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    await logger.error(`API Response Error: ${error.response?.status} ${error.config?.url}`, 'api', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const urlShortenerApi = {
  async createShortUrl(data: ShortUrlRequest): Promise<ShortUrlResponse> {
    try {
      await logger.info('Creating short URL', 'api', data);
      const response = await api.post<ShortUrlResponse>('/shorturls', data);
      await logger.info('Short URL created successfully', 'api', response.data);
      return response.data;
    } catch (error: any) {
      await logger.error(`Failed to create short URL: ${error.message}`, 'api', { 
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  async getShortUrlStats(shortcode: string): Promise<ShortUrlStats> {
    try {
      await logger.info(`Getting statistics for shortcode: ${shortcode}`, 'api', { shortcode });
      const response = await api.get<ShortUrlStats>(`/shorturls/${shortcode}`);
      await logger.info('Statistics retrieved successfully', 'api', response.data);
      return response.data;
    } catch (error: any) {
      await logger.error(`Failed to get statistics: ${error.message}`, 'api', { 
        shortcode,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  async getAllShortUrls(): Promise<ShortUrlStats[]> {
    try {
      await logger.info('Getting all short URLs', 'api');
      const response = await api.get<ShortUrlStats[]>('/shorturls');
      await logger.info(`Retrieved ${response.data.length} short URLs`, 'api', { count: response.data.length });
      return response.data;
    } catch (error: any) {
      await logger.error(`Failed to get all short URLs: ${error.message}`, 'api', { 
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
};
