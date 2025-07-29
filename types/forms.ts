export interface FormData {
  [key: string]: string;
}

export interface AuthFormData extends FormData {
  email: string;
  password: string;
}

export interface SignupFormData extends AuthFormData {
  username: string;
  confirmPassword: string;
  phone?: string;
}

export interface ForgotPasswordFormData extends FormData {
  email: string;
}

export interface UpdatePasswordFormData extends FormData {
  password: string;
  confirmPassword: string;
}

export interface OTPFormData extends FormData {
  otp: string;
}