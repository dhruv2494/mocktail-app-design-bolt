export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 6;

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  return password.length >= PASSWORD_MIN_LENGTH;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};

export const validateRequired = (value: string, fieldName?: string): boolean => {
  return value.trim().length > 0;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.trim());
};

export const validateOTP = (otp: string): boolean => {
  const otpRegex = /^[0-9]{6}$/;
  return otpRegex.test(otp.trim());
};

export const getValidationError = (
  field: 'email' | 'password' | 'confirmPassword' | 'phone' | 'otp' | 'required',
  value: string,
  compareValue?: string
): string | null => {
  switch (field) {
    case 'email':
      return !validateEmail(value) ? 'Please enter a valid email address' : null;
    case 'password':
      return !validatePassword(value) ? `Password must be at least ${PASSWORD_MIN_LENGTH} characters` : null;
    case 'confirmPassword':
      return !validatePasswordMatch(value, compareValue || '') ? 'Passwords do not match' : null;
    case 'phone':
      return !validatePhoneNumber(value) ? 'Please enter a valid 10-digit phone number' : null;
    case 'otp':
      return !validateOTP(value) ? 'Please enter a valid 6-digit OTP' : null;
    case 'required':
      return !validateRequired(value) ? 'This field is required' : null;
    default:
      return null;
  }
};