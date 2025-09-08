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
  if (!shortcode) return true; // Optional field
  const regex = /^[a-zA-Z0-9]{3,20}$/;
  return regex.test(shortcode);
}

export function isValidValidity(validity: string): boolean {
  if (!validity) return true; // Optional field
  const num = parseInt(validity, 10);
  return !isNaN(num) && num > 0 && num <= 525600; // Max 1 year
}

export async function validateUrlForm(data: { url: string; validity: string; shortcode: string }): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!data.url || typeof data.url !== 'string') {
    errors.push('URL is required');
  } else if (!isValidUrl(data.url)) {
    errors.push('Please enter a valid URL');
  }

  if (data.validity && !isValidValidity(data.validity)) {
    errors.push('Validity must be a positive number (minutes)');
  }

  if (data.shortcode && !isValidShortcode(data.shortcode)) {
    errors.push('Shortcode must be 3-20 alphanumeric characters');
  }

  if (errors.length > 0) {
    await logger.warn(`Form validation errors: ${errors.join(', ')}`, 'utils', { errors });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
