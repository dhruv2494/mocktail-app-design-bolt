import React, { useState } from 'react';
import { router } from 'expo-router';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setPendingVerification } from '@/store/slices/authSlice';
import { AuthLayout, FormInput, GradientButton, LinkText } from '@/components/shared';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFormValidation } from '@/hooks/auth/useFormValidation';
import { useAuthAPI } from '@/hooks/auth/useAuthAPI';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  
  const dispatch = useDispatch();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const { t } = useLanguage();
  const { executeAPI } = useAuthAPI();

  const { validateForm } = useFormValidation({
    email: { type: 'email', customMessage: t.auth.validation.invalidEmail },
  });

  const handleReset = async () => {
    const formData = { email };
    if (!validateForm(formData)) return;

    await executeAPI(
      () => forgotPassword({
        email: email.trim().toLowerCase(),
      }).unwrap(),
      {
        successMessage: t.auth.resetEmailSent,
        errorMessage: t.auth.resetEmailFailed,
        onSuccess: () => {
          dispatch(setPendingVerification({ 
            email: email.trim().toLowerCase(), 
            isOTPSent: true,
            type: 'forgot-password'
          }));
          setSent(true);
          setTimeout(() => router.push('/(auth)/otp-verify'), 1000);
        },
      }
    );
  };

  return (
    <AuthLayout 
      title={t.auth.forgotPassword} 
      subtitle={t.auth.forgotPasswordSubtitle}
    >
      <FormInput
        label={t.auth.email}
        placeholder={t.auth.enterEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!sent}
      />

      <GradientButton
        title={sent ? t.auth.emailSent : isLoading ? t.auth.sending : t.auth.resetPassword}
        onPress={handleReset}
        disabled={isLoading || sent || !email}
        loading={isLoading}
      />

      <LinkText
        prefix={t.auth.rememberPassword}
        linkText={t.auth.login}
        onPress={() => router.push('/(auth)/login')}
      />
    </AuthLayout>
  );
}