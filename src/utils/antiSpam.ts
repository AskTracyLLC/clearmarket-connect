// Anti-spam utilities for signup protection
import { supabase } from '@/integrations/supabase/client';

// Common disposable email domains - maintainable list
export const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  '20minutemail.com',
  '30minutemail.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.info',
  'mailinator.com',
  'mailinator2.com',
  'mailinator.net',
  'mailinator.org',
  'sogetthis.com',
  'spamgourmet.com',
  'spamgourmet.net',
  'spamgourmet.org',
  'tempmail.org',
  'temp-mail.org',
  'throwaway.email',
  'getnada.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'laoeq.com',
  'pookmail.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'uroid.com',
  'yopmail.com',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.fr.nf',
  'moncourrier.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'tmpmail.org',
  'tmpmail.net',
  'dispostable.com',
  'fakeinbox.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
  'mt2014.com',
  'mt2015.com',
  'thankyou2010.com',
  'trash2009.com',
  'mt2009.com',
  'mytrashmail.com',
  'shitmail.me',
  'deadaddress.com',
  'saynotospams.com',
  'spam4.me',
  'brefmail.com',
  'shortmail.net',
  'emltmp.com',
  'getairmail.com',
  'fastmail.fm',
  'guerrillamail.com',
  'inboxalias.com',
  'mailnesia.com',
  'soodonims.com',
  'spambox.us',
  'tempemail.com',
  'trbvm.com',
  'put2.net',
  'liner.name'
];

/**
 * Check if an email domain is in the disposable email list
 */
export const isDisposableEmail = (email: string): boolean => {
  try {
    const domain = email.toLowerCase().split('@')[1];
    return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
  } catch {
    return false;
  }
};

/**
 * Check if IP has exceeded rate limit for signups
 */
export const checkRateLimit = async (ipAddress?: string): Promise<boolean> => {
  if (!ipAddress) return true; // Allow if no IP tracking
  
  try {
    const { data, error } = await supabase.rpc('check_ip_rate_limit', {
      ip_addr: ipAddress,
      hours_window: 1,
      max_attempts: 3
    });
    
    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error to avoid blocking legitimate users
    }
    
    return data === true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // Allow on error
  }
};

/**
 * Check if email exists in either signup table
 */
export const checkDuplicateEmail = async (email: string): Promise<{
  exists: boolean;
  table?: 'field_rep_signups' | 'vendor_signups';
}> => {
  try {
    const [fieldRepResult, vendorResult] = await Promise.all([
      supabase
        .from('field_rep_signups')
        .select('email')
        .eq('email', email)
        .maybeSingle(),
      supabase
        .from('vendor_signups')
        .select('email')
        .eq('email', email)
        .maybeSingle()
    ]);

    if (fieldRepResult.data) {
      return { exists: true, table: 'field_rep_signups' };
    }
    
    if (vendorResult.data) {
      return { exists: true, table: 'vendor_signups' };
    }

    return { exists: false };
  } catch (error) {
    console.error('Duplicate email check failed:', error);
    return { exists: false }; // Allow on error to avoid blocking legitimate users
  }
};

/**
 * Log a signup attempt with all metadata
 */
export const logSignupAttempt = async ({
  email,
  userType,
  ipAddress,
  userAgent,
  success,
  failureReason,
  metadata,
  honeypotFilled = false,
  recaptchaScore,
  isDisposableEmail = false
}: {
  email: string;
  userType: 'field-rep' | 'vendor';
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  metadata?: Record<string, any>;
  honeypotFilled?: boolean;
  recaptchaScore?: number;
  isDisposableEmail?: boolean;
}): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('log_signup_attempt', {
      p_email: email,
      p_user_type: userType,
      p_ip_address: ipAddress || null,
      p_user_agent: userAgent || null,
      p_success: success,
      p_failure_reason: failureReason || null,
      p_metadata: metadata ? JSON.stringify(metadata) : null,
      p_honeypot_filled: honeypotFilled,
      p_recaptcha_score: recaptchaScore || null,
      p_is_disposable_email: isDisposableEmail
    });

    if (error) {
      console.error('Failed to log signup attempt:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error logging signup attempt:', error);
    return null;
  }
};

/**
 * Get client IP address (limited in browser environment)
 */
export const getClientIP = async (): Promise<string | undefined> => {
  try {
    // Note: This is limited in browser environments due to privacy restrictions
    // In production, you might want to pass IP from a server-side function
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return undefined;
  }
};

/**
 * Validate honeypot field (should be empty)
 */
export const validateHoneypot = (honeypotValue: string): boolean => {
  return honeypotValue === '' || honeypotValue == null;
};

/**
 * Generate user-friendly error messages for anti-spam rejections
 */
export const getAntiSpamErrorMessage = (reason: string): string => {
  switch (reason) {
    case 'disposable_email':
      return 'Please use a permanent email address. Temporary email services are not allowed.';
    case 'rate_limit':
      return 'Too many signups from your location. Please try again in an hour.';
    case 'honeypot':
      return 'Your submission appears to be automated. Please try again.';
    case 'recaptcha_failed':
      return 'Security verification failed. Please complete the reCAPTCHA and try again.';
    case 'duplicate_email':
      return 'This email address is already registered. Please use a different email or sign in.';
    default:
      return 'Security verification failed. Please try again.';
  }
};