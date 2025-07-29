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
 * Enhanced rate limiting with server-side validation
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

/**
 * Enhanced password validation
 */
export const isValidPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Secure admin role checking (replaces hardcoded emails)
 */
export const checkAdminRole = async (userId?: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.rpc('is_admin_user', { user_id_param: userId });
    return !error && data === true;
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};

/**
 * Input validation for common field types
 */
export const validateField = (value: string, type: string): { isValid: boolean; error?: string } => {
  switch (type) {
    case 'email':
      return { isValid: isValidEmail(value), error: isValidEmail(value) ? undefined : 'Invalid email format' };
    case 'phone':
      const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
      return { isValid: phoneRegex.test(value), error: phoneRegex.test(value) ? undefined : 'Invalid phone format' };
    case 'zipCode':
      const zipRegex = /^\d{5}(-\d{4})?$/;
      return { isValid: zipRegex.test(value), error: zipRegex.test(value) ? undefined : 'Invalid ZIP code format' };
    case 'username':
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      return { isValid: usernameRegex.test(value), error: usernameRegex.test(value) ? undefined : 'Username must be 3-20 characters, letters/numbers/underscore only' };
    default:
      return { isValid: value.length > 0, error: value.length > 0 ? undefined : 'Field is required' };
  }
};