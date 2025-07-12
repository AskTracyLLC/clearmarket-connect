import React, { useRef, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaWrapperProps {
  onVerify: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  size?: 'compact' | 'normal' | 'invisible';
  theme?: 'light' | 'dark';
  className?: string;
}

// Note: In production, store this in environment variables
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key for development

export const RecaptchaWrapper: React.FC<RecaptchaWrapperProps> = ({
  onVerify,
  onExpired,
  onError,
  size = 'normal',
  theme = 'light',
  className = ''
}) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = useCallback((token: string | null) => {
    onVerify(token);
  }, [onVerify]);

  const handleExpired = useCallback(() => {
    onVerify(null);
    if (onExpired) onExpired();
  }, [onVerify, onExpired]);

  const handleError = useCallback(() => {
    onVerify(null);
    if (onError) onError();
  }, [onVerify, onError]);

  const reset = useCallback(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, []);

  // Expose reset method to parent components
  React.useImperativeHandle(recaptchaRef, () => ({
    reset
  }));

  return (
    <div className={`recaptcha-wrapper ${className}`}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={RECAPTCHA_SITE_KEY}
        onChange={handleChange}
        onExpired={handleExpired}
        onError={handleError}
        size={size}
        theme={theme}
      />
    </div>
  );
};

export default RecaptchaWrapper;