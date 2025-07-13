# Anti-Spam Protection for Signup Flows

This document describes the comprehensive anti-spam measures implemented for both Field Rep and Vendor signup flows in ClearMarket Connect Pros.

## Overview

The following anti-spam protections have been added to prevent fake signups and maintain analytics integrity:

1. **Google reCAPTCHA v2** - Human verification
2. **Disposable Email Detection** - Blocks temporary email services
3. **Rate Limiting** - Limits signups per IP address
4. **Honeypot Field** - Catches automated bots
5. **Cross-Table Duplicate Detection** - Prevents duplicate emails across both signup tables
6. **Comprehensive Logging** - Tracks all signup attempts for analysis

## Implementation Details

### 1. Google reCAPTCHA v2

- **Location**: Added to both Field Rep and Vendor signup forms
- **Component**: `RecaptchaWrapper` component in `/src/components/ui/recaptcha-wrapper.tsx`
- **Configuration**: Uses environment variable `VITE_RECAPTCHA_SITE_KEY`
- **Validation**: Required before form submission

#### Setup Instructions:
1. Get reCAPTCHA site key from [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Set `VITE_RECAPTCHA_SITE_KEY` in environment variables
3. For development, the test key `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` is used

### 2. Disposable Email Detection

- **File**: `/src/utils/antiSpam.ts`
- **Method**: `isDisposableEmail(email: string)`
- **Database**: Maintains list of 70+ known disposable email domains
- **Action**: Rejects signup and logs attempt if disposable email detected

#### Supported Disposable Domains:
Includes major services like:
- Mailinator, Guerrilla Mail, TempMail
- YOPmail, TrashMail, 10MinuteMail
- And many others (see `DISPOSABLE_EMAIL_DOMAINS` array)

### 3. Rate Limiting

- **Database Function**: `check_ip_rate_limit(ip_addr, hours_window, max_attempts)`
- **Limit**: 3 successful signups per IP address per hour
- **Implementation**: Tracks by IP address in `signup_attempts` table
- **Fallback**: Allows signup if IP detection fails (to avoid blocking legitimate users)

### 4. Honeypot Field

- **Field Name**: `website` (hidden input field)
- **Validation**: Must remain empty for human users
- **Detection**: Bots often auto-fill all form fields
- **Action**: Rejects signup and logs as probable bot if filled

### 5. Enhanced Duplicate Detection

- **Previous**: Only checked within same user type table
- **Enhanced**: Checks across both `field_rep_signups` AND `vendor_signups` tables
- **Function**: `checkDuplicateEmail(email: string)`
- **Action**: Prevents same email from signing up as both Field Rep and Vendor

### 6. Comprehensive Logging

All signup attempts are logged to the `signup_attempts` table with:

- **Basic Info**: Email, user type, timestamp
- **Network Info**: IP address, user agent
- **Result**: Success/failure with detailed reason
- **Anti-Spam Data**: Honeypot status, reCAPTCHA score, disposable email flag
- **Metadata**: Additional context (form data on success, error details on failure)

## Database Schema

### New Table: `signup_attempts`

```sql
CREATE TABLE public.signup_attempts (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('field-rep', 'vendor')),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  metadata JSONB,
  honeypot_filled BOOLEAN DEFAULT false,
  recaptcha_score DECIMAL(3,2),
  is_disposable_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### New Functions

1. `check_ip_rate_limit(ip_addr, hours_window, max_attempts)` - Rate limiting check
2. `log_signup_attempt(...)` - Log signup attempts with metadata

## Error Messages

User-friendly error messages are displayed for each rejection reason:

- **Disposable Email**: "Please use a permanent email address. Temporary email services are not allowed."
- **Rate Limit**: "Too many signups from your location. Please try again in an hour."
- **Honeypot**: "Your submission appears to be automated. Please try again."
- **reCAPTCHA**: "Security verification failed. Please complete the reCAPTCHA and try again."
- **Duplicate Email**: "This email address is already registered. Please use a different email or sign in."

## Manual Testing Instructions

### Test Case 1: Normal Signup Flow
1. Fill out either Field Rep or Vendor form with valid data
2. Use a legitimate email address (not disposable)
3. Complete reCAPTCHA verification
4. Submit form
5. **Expected**: Successful signup with success message

### Test Case 2: Disposable Email Detection
1. Fill out form with email from disposable service (e.g., test@guerrillamail.com)
2. Complete reCAPTCHA
3. Submit form
4. **Expected**: Error message about temporary email services

### Test Case 3: Rate Limiting
1. Successfully complete 3 signups from same IP
2. Attempt 4th signup from same IP within 1 hour
3. **Expected**: Rate limit error message

### Test Case 4: Honeypot Detection
1. Use browser developer tools to unhide honeypot field
2. Fill in the honeypot field with any value
3. Submit form
4. **Expected**: Automated submission error message

### Test Case 5: reCAPTCHA Validation
1. Fill out form completely
2. Do NOT complete reCAPTCHA verification
3. Submit form
4. **Expected**: Error about completing reCAPTCHA

### Test Case 6: Duplicate Email Prevention
1. Sign up as Field Rep with email test@example.com
2. Attempt to sign up as Vendor with same email
3. **Expected**: Error about email already registered

### Test Case 7: Cross-Browser/Device Testing
1. Test signup flows in different browsers
2. Test on mobile devices
3. Test with different screen sizes
4. **Expected**: Consistent behavior across platforms

## Analytics and Monitoring

### Admin Dashboard Access
Admins can view signup attempt logs via:
```sql
SELECT * FROM signup_attempts 
ORDER BY created_at DESC 
LIMIT 100;
```

### Key Metrics to Monitor
- Success rate vs. failure rate
- Common failure reasons
- IP addresses with multiple failed attempts
- Disposable email attempt patterns
- Honeypot trigger frequency

### Alerts to Set Up
- Unusually high failure rates (possible attack)
- Many attempts from single IP
- High honeypot trigger rate
- reCAPTCHA failures spikes

## Security Considerations

1. **Client IP Limitation**: Browser-based IP detection is limited; consider server-side IP collection
2. **reCAPTCHA Keys**: Store site keys securely in environment variables
3. **Rate Limiting**: May need adjustment based on legitimate user patterns
4. **Disposable Email List**: Should be updated periodically as new services emerge
5. **Logging Privacy**: Ensure compliance with privacy regulations when storing user data

## Future Enhancements

1. **Advanced reCAPTCHA**: Upgrade to v3 for seamless user experience
2. **Machine Learning**: Implement ML-based spam detection
3. **Real-time API**: Use external services for disposable email detection
4. **Behavioral Analysis**: Track mouse movements and typing patterns
5. **Geographic Restrictions**: Implement country-based blocking if needed

## Troubleshooting

### Common Issues

1. **reCAPTCHA Not Loading**
   - Check `VITE_RECAPTCHA_SITE_KEY` environment variable
   - Verify domain is registered with reCAPTCHA
   - Check network/firewall restrictions

2. **Rate Limiting Too Strict**
   - Review IP detection accuracy
   - Consider increasing limits for legitimate use cases
   - Check for shared IP environments (offices, etc.)

3. **False Positive Disposable Email Detection**
   - Review and update `DISPOSABLE_EMAIL_DOMAINS` list
   - Consider whitelist for known legitimate domains
   - Implement manual override for admins

4. **Honeypot False Positives**
   - Check for auto-fill software interference
   - Verify field is properly hidden
   - Consider different honeypot strategies

## File Locations

- **Main signup logic**: `/src/pages/Index.tsx`
- **Anti-spam utilities**: `/src/utils/antiSpam.ts`
- **reCAPTCHA component**: `/src/components/ui/recaptcha-wrapper.tsx`
- **Database migration**: `/supabase/migrations/20250712180000-create-signup-attempts.sql`
- **Type definitions**: `/src/integrations/supabase/types.ts`
- **Environment example**: `/.env.example`