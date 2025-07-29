import React, { useState } from 'react';
import { router } from 'expo-router';
import { useRegisterMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials, setPendingVerification } from '@/store/slices/authSlice';
import { AuthLayout, FormInput, GradientButton, LinkText } from '@/components/shared';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFormValidation } from '@/hooks/auth/useFormValidation';
import { useAuthAPI } from '@/hooks/auth/useAuthAPI';
import { showSuccess } from '@/utils/toast';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const { t } = useLanguage();
  const { executeAPI } = useAuthAPI();
  
  const { validateForm } = useFormValidation({
    name: { type: 'required' },
    email: { type: 'email' },
    password: { type: 'password' },
    confirmPassword: { type: 'confirmPassword', compareField: 'password' },
  });


  const handleSignup = async () => {
    const formData = {
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    };
    
    if (!validateForm(formData)) return;

    await executeAPI(
      () => register({
        username: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
      }).unwrap(),
      {
        errorMessage: t.auth.signupFailed,
        onSuccess: (data) => {
          dispatch(setCredentials({ token: data.token }));
          dispatch(setPendingVerification({ 
            email: email.trim().toLowerCase(), 
            isOTPSent: true,
            type: 'registration'
          }));
          showSuccess(t.auth.signupSuccess, t.auth.otpSentSuccess);
          router.push('/(auth)/otp-verify');
        }
      }
    );
  };

  return (
    <AuthLayout title={t.auth.createAccount} subtitle={t.auth.signupSubtitle}>
      <FormInput
        label={t.auth.name}
        placeholder={t.auth.enterName}
        value={name}
        onChangeText={setName}
      />

      <FormInput
        label={t.auth.email}
        placeholder={t.auth.enterEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <FormInput
        label={t.auth.password}
        placeholder={t.auth.createPassword}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <FormInput
        label={t.auth.confirmPassword}
        placeholder={t.auth.confirmYourPassword}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <FormInput
        label={t.auth.phone}
        placeholder={t.auth.enterPhone}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <GradientButton
        title={isLoading ? t.auth.signingUp : t.auth.signup}
        onPress={handleSignup}
        disabled={isLoading}
        loading={isLoading}
      />

      <LinkText
        prefix={t.auth.alreadyHaveAccount}
        linkText={t.auth.login}
        onPress={() => router.push('/(auth)/login')}
      />
    </AuthLayout>
  );
}

