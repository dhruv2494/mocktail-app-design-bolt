import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showAPIError, showAPISuccess } from '@/utils/toast';
import { setError } from '@/store/slices/authSlice';
import { APIError } from '@/types/api';

interface UseAuthAPIOptions<T = any> {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: APIError) => void;
}

export const useAuthAPI = () => {
  const dispatch = useDispatch();

  const executeAPI = useCallback(
    async <T = any>(
      apiCall: () => Promise<T>,
      options: UseAuthAPIOptions<T> = {}
    ) => {
      const {
        successMessage,
        errorMessage = 'Something went wrong',
        onSuccess,
        onError,
      } = options;

      try {
        const result = await apiCall();
        const data = result.data ? result : { data: result };

        if (successMessage) {
          showAPISuccess(successMessage);
        }

        if (onSuccess) {
          onSuccess(data.data);
        }

        return { success: true, data: data.data };
      } catch (error: unknown) {
        console.error('API Error:', error);
        
        const apiError = error as APIError;
        const message = apiError?.data?.message || apiError?.message || errorMessage;
        
        dispatch(setError(message));
        showAPIError(apiError, errorMessage);

        if (onError) {
          onError(apiError);
        }

        return { success: false, error: apiError };
      }
    },
    [dispatch]
  );

  return { executeAPI };
};