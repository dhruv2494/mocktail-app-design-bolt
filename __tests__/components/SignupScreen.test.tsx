import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

import SignupScreen from '../../app/(auth)/signup';
import authSlice from '../../store/slices/authSlice';
import { authApi } from '../../store/api/authApi';

// Mock dependencies
jest.mock('react-native-toast-message');
jest.mock('expo-router');

const mockToast = Toast as jest.Mocked<typeof Toast>;
const mockRouter = router as jest.Mocked<typeof router>;

// Mock the register mutation
const mockRegister = jest.fn();

// Create a test store
const createTestStore = () => {
  const store = configureStore({
    reducer: {
      auth: authSlice,
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware),
  });

  // Mock the register mutation
  jest.spyOn(authApi, 'useRegisterMutation').mockReturnValue([
    mockRegister,
    { isLoading: false, error: null, data: null },
  ] as any);

  return store;
};

const renderWithProvider = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockResolvedValue({
      unwrap: () => Promise.resolve({ token: 'test-token' }),
    });
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<SignupScreen />);

    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Sign up to get started')).toBeTruthy();
    expect(getByPlaceholderText('Enter your name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Create a password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm your password')).toBeTruthy();
    expect(getByPlaceholderText('Enter your phone number')).toBeTruthy();
  });

  it('shows validation error for empty name', async () => {
    const { getByText } = renderWithProvider(<SignupScreen />);
    
    const signupButton = getByText('Sign Up');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Name is required',
      });
    });
  });

  it('shows validation error for empty email', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<SignupScreen />);
    
    const nameInput = getByPlaceholderText('Enter your name');
    fireEvent.changeText(nameInput, 'John Doe');

    const signupButton = getByText('Sign Up');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Email is required',
      });
    });
  });

  it('shows validation error for password mismatch', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<SignupScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Enter your name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Create a password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'differentpassword');

    const signupButton = getByText('Sign Up');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Passwords do not match',
      });
    });
  });

  it('shows validation error for short password', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<SignupScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Enter your name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Create a password'), '123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), '123');

    const signupButton = getByText('Sign Up');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Password must be at least 6 characters',
      });
    });
  });

  it('handles successful signup', async () => {
    const { getByText, getByPlaceholderText } = renderWithProvider(<SignupScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Enter your name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Create a password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '1234567890');

    const signupButton = getByText('Sign Up');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
      });
    });

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Please check your email for OTP verification',
      });
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/otp-verify');
    });
  });

  it('handles signup failure', async () => {
    const errorMessage = 'User Already Exists with this Email!';
    mockRegister.mockRejectedValueOnce({
      data: { message: errorMessage },
    });

    const { getByText, getByPlaceholderText } = renderWithProvider(<SignupScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Enter your name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'existing@example.com');
    fireEvent.changeText(getByPlaceholderText('Create a password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm your password'), 'password123');

    const signupButton = getByText('Sign Up');
    fireEvent.press(signupButton);

    await waitFor(() => {
      expect(mockToast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
      });
    });
  });

  it('navigates to login screen when login link is pressed', () => {
    const { getByText } = renderWithProvider(<SignupScreen />);
    
    const loginLink = getByText('Login');
    fireEvent.press(loginLink);

    expect(mockRouter.push).toHaveBeenCalledWith('/(auth)/login');
  });
});