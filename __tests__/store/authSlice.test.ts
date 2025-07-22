import authSlice, {
  setCredentials,
  setLoading,
  setError,
  clearError,
  setPendingVerification,
  clearPendingVerification,
  logout,
  initializeAuth,
  AuthState,
} from '../../store/slices/authSlice';

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    pendingVerification: {
      email: null,
      isOTPSent: false,
    },
  };

  it('should return the initial state', () => {
    expect(authSlice(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCredentials', () => {
    const token = 'test-token';
    const user = {
      uuid: 'test-uuid',
      email: 'test@example.com',
      username: 'testuser',
    };

    const actual = authSlice(initialState, setCredentials({ token, user }));

    expect(actual.token).toEqual(token);
    expect(actual.user).toEqual(user);
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.error).toBeNull();
  });

  it('should handle setLoading', () => {
    const actual = authSlice(initialState, setLoading(true));
    expect(actual.isLoading).toBe(true);
  });

  it('should handle setError', () => {
    const errorMessage = 'Test error message';
    const actual = authSlice(initialState, setError(errorMessage));
    expect(actual.error).toEqual(errorMessage);
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const actual = authSlice(stateWithError, clearError());
    expect(actual.error).toBeNull();
  });

  it('should handle setPendingVerification', () => {
    const email = 'test@example.com';
    const actual = authSlice(
      initialState,
      setPendingVerification({ email, isOTPSent: true })
    );

    expect(actual.pendingVerification.email).toEqual(email);
    expect(actual.pendingVerification.isOTPSent).toBe(true);
  });

  it('should handle clearPendingVerification', () => {
    const stateWithPending = {
      ...initialState,
      pendingVerification: { email: 'test@example.com', isOTPSent: true },
    };
    const actual = authSlice(stateWithPending, clearPendingVerification());

    expect(actual.pendingVerification.email).toBeNull();
    expect(actual.pendingVerification.isOTPSent).toBe(false);
  });

  it('should handle logout', () => {
    const authenticatedState: AuthState = {
      user: {
        uuid: 'test-uuid',
        email: 'test@example.com',
        username: 'testuser',
      },
      token: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      pendingVerification: {
        email: 'test@example.com',
        isOTPSent: true,
      },
    };

    const actual = authSlice(authenticatedState, logout());

    expect(actual.user).toBeNull();
    expect(actual.token).toBeNull();
    expect(actual.isAuthenticated).toBe(false);
    expect(actual.error).toBeNull();
    expect(actual.pendingVerification.email).toBeNull();
    expect(actual.pendingVerification.isOTPSent).toBe(false);
  });

  it('should handle initializeAuth with token', () => {
    const token = 'test-token';
    const user = {
      uuid: 'test-uuid',
      email: 'test@example.com',
      username: 'testuser',
    };

    const actual = authSlice(initialState, initializeAuth({ token, user }));

    expect(actual.token).toEqual(token);
    expect(actual.user).toEqual(user);
    expect(actual.isAuthenticated).toBe(true);
  });

  it('should handle initializeAuth without token', () => {
    const actual = authSlice(initialState, initializeAuth({}));
    expect(actual).toEqual(initialState);
  });
});