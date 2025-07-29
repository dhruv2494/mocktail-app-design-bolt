import Toast from 'react-native-toast-message';
import { APIError } from '@/types/api';

interface ToastOptions {
  position?: 'top' | 'bottom';
  visibilityTime?: number;
}

const DEFAULT_OPTIONS: ToastOptions = {
  position: 'top',
  visibilityTime: 3000,
};

export const showError = (title: string, message?: string, options?: ToastOptions) => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    ...DEFAULT_OPTIONS,
    ...options,
  });
};

export const showSuccess = (title: string, message?: string, options?: ToastOptions) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    ...DEFAULT_OPTIONS,
    ...options,
  });
};

export const showInfo = (title: string, message?: string, options?: ToastOptions) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    ...DEFAULT_OPTIONS,
    ...options,
  });
};

export const showValidationError = (fieldName: string, errorMessage: string, options?: ToastOptions) => {
  showError(`${fieldName} Error`, errorMessage, options);
};

export const showAPIError = (error: APIError, defaultMessage: string = 'Something went wrong') => {
  const errorMessage = error?.data?.message || error?.message || defaultMessage;
  showError('Error', errorMessage);
};

export const showAPISuccess = (message: string, description?: string) => {
  showSuccess(message, description);
};