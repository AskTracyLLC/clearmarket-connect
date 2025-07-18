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
    console.log("=== DISPOSABLE EMAIL CHECK ===");
    console.log("Checking email:", email, "at", new Date().toISOString());
    const domain = email.toLowerCase().split('@')[1];
    const isDisposable = DISPOSABLE_EMAIL_DOMAINS.includes(domain);
    console.log("Domain:", domain, "- Is disposable:", isDisposable);
    return isDisposable;
  } catch (error) {
    console.error("Error checking disposable email:", error);
    return false;
  }
};

/**
 * Check if IP has exceeded rate limit for signups
 * Increased limit from 3 to 10 for mobile networks
 */
export const checkRateLimit = async (ipAddress?: string): Promise<boolean> => {
  if (!ipAddress) {
    console.log("=== RATE LIMIT CHECK ===");
    console.log("No IP address provided - allowing signup");
    return true;
  }
  
  try {
    console.log("=== RATE LIMIT CHECK ===");
    console.log("Checking rate limit for IP:", ipAddress, "at", new Date().toISOString());
    
    // Simple rate limiting based on local storage for now
    // In production, implement server-side rate limiting
    const now = Date.now();
    const rateKey = `rate_limit_${ipAddress}`;
    const attempts = JSON.parse(localStorage.getItem(rateKey) || '[]');
    
    // Remove attempts older than 1 hour
    const validAttempts = attempts.filter((timestamp: number) => now - timestamp < 3600000);
    
    // Check if we have exceeded 10 attempts in the last hour (increased from 3)
    console.log("Rate limit status:", {
      ip: ipAddress,
      validAttempts: validAttempts.length,
      limit: 10,
      willBlock: validAttempts.length >= 10,
      timeWindow: "1 hour"
    });
    
    if (validAttempts.length >= 10) {
      console.warn("RATE LIMIT EXCEEDED for IP:", ipAddress);
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    localStorage.setItem(rateKey, JSON.stringify(validAttempts));
    
    console.log("Rate limit check PASSED - attempt logged");
    return true;
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
  table?: 'pre_launch_signups';
}> => {
  try {
    console.log("=== DUPLICATE EMAIL CHECK ===");
    console.log("Checking for duplicate email:", email, "at", new Date().toISOString());
    
    // Check pre_launch_signups table instead of separate tables
    const result = await supabase
      .from('pre_launch_signups')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (result.data) {
      console.log("DUPLICATE FOUND in pre_launch_signups table");
      return { exists: true, table: 'pre_launch_signups' };
    }

    console.log("No duplicate found - email is unique");
    return { exists: false };
  } catch (error) {
    console.error('Duplicate email check failed:', error);
    return { exists: false }; // Allow on error to avoid blocking legitimate users
  }
};

/**
 * Log a signup attempt with all metadata
 * Enhanced version with detailed logging
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
    console.log("=== SIGNUP ATTEMPT LOG ===");
    console.log("Logging signup attempt for:", email, "at", new Date().toISOString());
    
    // Enhanced logging with mobile detection
    const isMobile = userAgent ? /Mobile|Android|iPhone|iPad/i.test(userAgent) : false;
    
    const logData = {
      email,
      userType,
      ipAddress,
      userAgent: userAgent?.substring(0, 200), // Truncate long user agents
      success,
      failureReason,
      metadata,
      honeypotFilled,
      recaptchaScore,
      isDisposableEmail,
      isMobile,
      timestamp: new Date().toISOString(),
      browserInfo: {
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      }
    };
    
    // Log to console for now - in production, you'd want to store this in a database
    console.log('=== DETAILED SIGNUP ATTEMPT DATA ===');
    console.log(JSON.stringify(logData, null, 2));

    if (success) {
      console.log("✅ SUCCESSFUL SIGNUP LOGGED");
    } else {
      console.warn("❌ FAILED SIGNUP LOGGED - Reason:", failureReason);
    }

    return 'logged';
  } catch (error) {
    console.error('Error logging signup attempt:', error);
    return null;
  }
};

/**
 * Get client IP address with fallback options
 */
export const getClientIP = async (): Promise<string | undefined> => {
  console.log("=== GETTING CLIENT IP ===");
  console.log("Attempting to fetch client IP at", new Date().toISOString());
  
  try {
    // Primary IP service
    const response = await fetch('https://api.ipify.org?format=json', {
      timeout: 5000
    } as any);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Successfully got IP from ipify.org:", data.ip);
    return data.ip;
  } catch (error) {
    console.warn("Primary IP service failed:", error);
    
    try {
      // Fallback IP service
      console.log("Trying fallback IP service...");
      const fallbackResponse = await fetch('https://httpbin.org/ip', {
        timeout: 5000
      } as any);
      
      if (!fallbackResponse.ok) {
        throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log("Successfully got IP from httpbin.org:", fallbackData.origin);
      return fallbackData.origin;
    } catch (fallbackError) {
      console.error("All IP services failed:", fallbackError);
      console.log("Using fallback IP for testing");
      return "127.0.0.1"; // Fallback for testing
    }
  }
};

/**
 * Validate honeypot field (should be empty)
 */
export const validateHoneypot = (honeypotValue: string): boolean => {
  console.log("=== HONEYPOT VALIDATION ===");
  const isValid = honeypotValue === '' || honeypotValue == null;
  console.log("Honeypot field value:", honeypotValue ? "FILLED (SUSPICIOUS)" : "empty (valid)");
  console.log("Honeypot validation result:", isValid ? "PASSED" : "FAILED");
  return isValid;
};

/**
 * Generate user-friendly error messages for anti-spam rejections
 * Updated with mobile-friendly messaging
 */
export const getAntiSpamErrorMessage = (reason: string): string => {
  console.log("=== GENERATING ERROR MESSAGE ===");
  console.log("Error reason:", reason);
  
  switch (reason) {
    case 'disposable_email':
      return 'Please use a permanent email address. Temporary email services are not allowed.';
    case 'rate_limit':
      return 'Too many signups from your location (10 per hour limit). If on mobile, try switching to WiFi or try again later.';
    case 'honeypot':
      return 'Your submission appears to be automated. Please try again manually.';
    case 'recaptcha_failed':
      return 'Security verification failed. Please complete the reCAPTCHA. If on mobile, check your internet connection and try again.';
    case 'duplicate_email':
      return 'This email address is already registered. Please use a different email or contact support.';
    default:
      return 'Security verification failed. Please try again or contact support if the issue persists.';
  }
};
