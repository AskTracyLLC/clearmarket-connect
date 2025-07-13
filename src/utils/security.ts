// Security utilities for input sanitization and validation
import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * Safely sanitizes HTML content using DOMPurify
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'table', 'tr', 'td', 'th',
      'thead', 'tbody', 'tfoot'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'width', 'height', 'style', 'class'
    ],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });
};

/**
 * Validates and sanitizes form data
 */
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = {} as T;
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string') {
      // Don't sanitize HTML content fields that need to preserve formatting
      if (key.includes('html_content') || key.includes('html')) {
        (sanitized as any)[key] = sanitizeHtml(value);
      } else {
        (sanitized as any)[key] = sanitizeInput(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      (sanitized as any)[key] = sanitizeObject(value);
    } else {
      (sanitized as any)[key] = value;
    }
  });
  
  return sanitized;
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates user role
 */
export const isValidUserRole = (role: string): boolean => {
  const validRoles = ['admin', 'moderator', 'vendor', 'field_rep'];
  return validRoles.includes(role);
};

/**
 * Sanitizes object properties recursively
 */
export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Rate limiting helper
 */
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old attempts
    const userAttempts = attempts.get(identifier) || [];
    const recentAttempts = userAttempts.filter(time => time > windowStart);
    
    if (recentAttempts.length >= maxAttempts) {
      return false; // Rate limit exceeded
    }
    
    recentAttempts.push(now);
    attempts.set(identifier, recentAttempts);
    return true;
  };
};