import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth, logout } from '../store/slices/authSlice';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id: string;
  email: string;
  exp: number;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const initializeAuthState = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Verify token is not expired
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp > currentTime) {
            dispatch(initializeAuth({ 
              token,
              user: {
                uuid: decoded.id,
                email: decoded.email,
                username: '', // Will be populated from user profile if needed
              }
            }));
          } else {
            // Token expired
            await AsyncStorage.removeItem('token');
            dispatch(logout());
          }
        } catch (error) {
          // Invalid token
          await AsyncStorage.removeItem('token');
          dispatch(logout());
        }
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
    }
  }, [dispatch]);

  const logoutUser = async () => {
    try {
      await AsyncStorage.removeItem('token');
      dispatch(logout());
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    ...auth,
    initializeAuthState,
    logoutUser,
    isLoggedIn: auth.isAuthenticated && !!auth.token,
  };
};