export interface ShortUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface ShortUrlResponse {
  shortlink: string;
  expiry: string;
}

export interface ClickData {
  timestamp: string;
  referrer?: string;
  location?: string;
  userAgent?: string;
}

export interface ShortUrlStats {
  shortcode: string;
  originalUrl: string;
  shortlink: string;
  createdAt: string;
  expiry: string;
  clickCount: number;
  clicks: ClickData[];
}

export interface UrlFormData {
  url: string;
  validity: string;
  shortcode: string;
}
