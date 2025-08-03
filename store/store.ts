import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authSlice from './slices/authSlice';
import { authApi } from './api/authApi';
import { pdfApi } from './api/pdfApi';
import { freeTestsApi } from './api/freeTestsApi';
import { testSeriesApi } from './api/testSeriesApi';
import { quizApi } from './api/quizApi';
import { notificationsApi } from './api/notificationsApi';
import { hierarchicalTestApi } from './api/hierarchicalTestApi';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [authApi.reducerPath]: authApi.reducer,
    [pdfApi.reducerPath]: pdfApi.reducer,
    [freeTestsApi.reducerPath]: freeTestsApi.reducer,
    [testSeriesApi.reducerPath]: testSeriesApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [hierarchicalTestApi.reducerPath]: hierarchicalTestApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      authApi.middleware, 
      pdfApi.middleware,
      freeTestsApi.middleware,
      testSeriesApi.middleware,
      quizApi.middleware,
      notificationsApi.middleware,
      hierarchicalTestApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;