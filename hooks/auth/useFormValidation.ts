import { useState, useCallback } from 'react';
import { getValidationError } from '@/utils/validation';
import { showValidationError } from '@/utils/toast';
import { FormData } from '@/types/forms';

interface ValidationRules {
  [key: string]: {
    type: 'email' | 'password' | 'confirmPassword' | 'phone' | 'otp' | 'required';
    compareField?: string;
    customMessage?: string;
  };
}

interface ValidationErrors {
  [key: string]: string | null;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback(
    (fieldName: string, value: string, formData?: FormData): boolean => {
      const rule = rules[fieldName];
      if (!rule) return true;

      const compareValue = rule.compareField && formData ? formData[rule.compareField] : undefined;
      const error = getValidationError(rule.type, value, compareValue);

      setErrors(prev => ({
        ...prev,
        [fieldName]: error,
      }));

      if (error) {
        showValidationError(fieldName.charAt(0).toUpperCase() + fieldName.slice(1), 
          rule.customMessage || error);
        return false;
      }

      return true;
    },
    [rules]
  );

  const validateForm = useCallback(
    (formData: FormData): boolean => {
      let isValid = true;
      const newErrors: ValidationErrors = {};

      Object.keys(rules).forEach(fieldName => {
        const rule = rules[fieldName];
        const value = formData[fieldName] || '';
        const compareValue = rule.compareField ? formData[rule.compareField] : undefined;
        const error = getValidationError(rule.type, value, compareValue);

        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        } else {
          newErrors[fieldName] = null;
        }
      });

      setErrors(newErrors);

      if (!isValid) {
        const firstError = Object.entries(newErrors).find(([_, error]) => error !== null);
        if (firstError) {
          const [fieldName, error] = firstError;
          showValidationError(
            fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
            rules[fieldName].customMessage || error!
          );
        }
      }

      return isValid;
    },
    [rules]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: null,
    }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
  };
};