import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useLoginMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials, setError } from '@/store/slices/authSlice';
import { AuthLayout, FormInput, GradientButton, LinkText } from '@/components/shared';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const validateForm = () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: t.common.error,
        text2: t.auth.validation.emailRequired,
      });
      return false;
    }
    if (!password.trim()) {
      Toast.show({
        type: 'error',
        text1: t.common.error,
        text2: t.auth.validation.passwordRequired,
      });
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();

      dispatch(setCredentials({ token: result.token }));

      Toast.show({
        type: 'success',
        text1: t.auth.loginSuccess,
        text2: t.auth.welcomeBack,
      });

      router.push('/');
    } catch (error: any) {
      const errorMessage = error?.data?.message || t.auth.loginFailed;
      dispatch(setError(errorMessage));
      Toast.show({
        type: 'error',
        text1: t.auth.loginFailed,
        text2: errorMessage,
      });
    }
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
