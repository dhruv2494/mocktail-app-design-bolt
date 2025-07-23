import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useLazyGetProfileQuery } from '@/store/api/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { initializeAuth, logout } from '@/store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireEmailVerification = true 
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);
  const [getProfile] = useLazyGetProfileQuery();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // If not authenticated, check for stored token
        if (!isAuthenticated || !token) {
          const storedToken = await AsyncStorage.getItem('token');
          
          if (storedToken) {
            // Validate token by fetching profile
            const profileResult = await getProfile();
            
            if (profileResult.data?.success) {
              // Initialize auth state with stored token and user data
              dispatch(initializeAuth({
                token: storedToken,
                user: profileResult.data.user
              }));
              return;
            } else {
              // Invalid token, remove it
              await AsyncStorage.removeItem('token');
              dispatch(logout());
            }
          }
          
          // No valid authentication, redirect to login
          router.replace('/(auth)/login');
          return;
        }

        // If authenticated but email verification is required
        if (requireEmailVerification && user && !user.isEmailVerified) {
          router.replace('/(auth)/otp-verify');
          return;
        }

      } catch (error) {
        console.error('Auth check failed:', error);
        // On error, clear auth state and redirect
        dispatch(logout());
        router.replace('/(auth)/login');
      }
    };

    checkAuthStatus();
  }, [isAuthenticated, user, token, requireEmailVerification, router, dispatch, getProfile]);

  // Don't render children if not authenticated or email not verified (when required)
  if (!isAuthenticated || (requireEmailVerification && user && !user.isEmailVerified)) {
    return null;
  }

  return <>{children}</>;
};

// Hook for easy access to auth guard functionality
export const useAuthGuard = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return false;
    }
    return true;
  };

  const requireEmailVerification = () => {
    if (!user?.isEmailVerified) {
      router.replace('/(auth)/otp-verify');
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    isEmailVerified: user?.isEmailVerified ?? false,
    requireAuth,
    requireEmailVerification,
  };
};