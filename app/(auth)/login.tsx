import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useLoginMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { AuthLayout, FormInput, GradientButton, LinkText } from '@/components/shared';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFormValidation } from '@/hooks/auth/useFormValidation';
import { useAuthAPI } from '@/hooks/auth/useAuthAPI';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { executeAPI } = useAuthAPI();

  const { validateForm } = useFormValidation({
    email: { type: 'required', customMessage: t.auth.validation.emailRequired },
    password: { type: 'required', customMessage: t.auth.validation.passwordRequired },
  });

  const handleLogin = async () => {
    const formData = { email, password };
    if (!validateForm(formData)) return;

    await executeAPI(
      () => login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap(),
      {
        successMessage: t.auth.loginSuccess,
        errorMessage: t.auth.loginFailed,
        onSuccess: (data) => {
          dispatch(setCredentials({ token: data.token }));
          router.push('/');
        },
      }
    );
  };

  const styles = getStyles(Colors);

  return (
    <AuthLayout title={t.auth.welcomeBack} subtitle={t.auth.loginSubtitle}>
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
        placeholder={t.auth.enterPassword}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <LinkText
        linkText={t.auth.forgotPassword}
        onPress={() => router.push('/(auth)/forgot-password')}
        style={styles.forgotLink}
      />

      <GradientButton
        title={isLoading ? t.auth.loggingIn : t.auth.login}
        onPress={handleLogin}
        disabled={isLoading}
        loading={isLoading}
      />

      <LinkText
        prefix={t.auth.dontHaveAccount}
        linkText={t.auth.signup}
        onPress={() => router.push('/(auth)/signup')}
      />
    </AuthLayout>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: 0,
    marginBottom: 16,
  },
});