import React from 'react';
import { sanitizeHtml } from '@/utils/security';

interface SecureHtmlPreviewProps {
  html: string;
  className?: string;
}

/**
 * Secure component for previewing HTML content with XSS protection
 */
export const SecureHtmlPreview: React.FC<SecureHtmlPreviewProps> = ({ 
  html, 
  className = '' 
}) => {
  const sanitizedHtml = sanitizeHtml(html);
  
  return (
    <div 
      className={`${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};