import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateField, sanitizeInput } from '@/utils/security';
import { cn } from '@/lib/utils';

interface SecureFormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'phone' | 'zipCode' | 'username' | 'password';
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  autoSanitize?: boolean;
}

/**
 * Secure form field component with built-in validation and sanitization
 * Prevents XSS attacks and validates user input according to security best practices
 */
export const SecureFormField: React.FC<SecureFormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onValidationChange,
  placeholder,
  required = false,
  className,
  inputClassName,
  autoSanitize = true,
}) => {
  const [validationError, setValidationError] = useState<string | undefined>();
  const [isTouched, setIsTouched] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = autoSanitize ? sanitizeInput(rawValue) : rawValue;
    
    // Validate the input
    const validation = validateField(sanitizedValue, type);
    const error = required && !sanitizedValue ? 'This field is required' : validation.error;
    
    setValidationError(error);
    onValidationChange?.(validation.isValid && (!required || !!sanitizedValue), error);
    
    onChange(sanitizedValue);
  }, [onChange, onValidationChange, type, required, autoSanitize]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    
    // Re-validate on blur
    const validation = validateField(value, type);
    const error = required && !value ? 'This field is required' : validation.error;
    
    setValidationError(error);
    onValidationChange?.(validation.isValid && (!required || !!value), error);
  }, [value, type, required, onValidationChange]);

  const isError = isTouched && !!validationError;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className={cn(isError && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type === 'password' ? 'password' : 'text'}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        aria-invalid={isError}
        aria-describedby={isError ? `${id}-error` : undefined}
        className={cn(
          isError && 'border-destructive focus:border-destructive',
          inputClassName
        )}
      />
      {isError && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
};

export default SecureFormField;