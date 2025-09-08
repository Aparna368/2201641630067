import { logger } from './logger';

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidShortcode(shortcode: string): boolean {
  // Alphanumeric, 3-20 characters
  const regex = /^[a-zA-Z0-9]{3,20}$/;
  return regex.test(shortcode);
}

export function isValidValidity(validity: number): boolean {
  return Number.isInteger(validity) && validity > 0 && validity <= 525600; // Max 1 year
}

export async function validateShortUrlRequest(data: any): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!data.url || typeof data.url !== 'string') {
    errors.push('URL is required and must be a string');
  } else if (!isValidUrl(data.url)) {
    errors.push('URL must be a valid URL format');
  }

  if (data.validity !== undefined) {
    if (!isValidValidity(data.validity)) {
      errors.push('Validity must be a positive integer (minutes)');
    }
  }

  if (data.shortcode !== undefined) {
    if (typeof data.shortcode !== 'string') {
      errors.push('Shortcode must be a string');
    } else if (!isValidShortcode(data.shortcode)) {
      errors.push('Shortcode must be 3-20 alphanumeric characters');
    }
  }

  if (errors.length > 0) {
    await logger.warn(`Validation errors: ${errors.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
