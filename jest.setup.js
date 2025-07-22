import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

global.__DEV__ = true;