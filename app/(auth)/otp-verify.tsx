import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useVerifyOTPMutation } from '@/store/api/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearPendingVerification, setError } from '@/store/slices/authSlice';
import { AuthLayout, FormInput, GradientButton, LinkText } from '@/components/shared';
import { useLanguage } from '@/contexts/LanguageContext';

export default function OtpVerifyScreen() {
  const [otp, setOtp] = useState('');
  const [resent, setResent] = useState(false);
  const [verified, setVerified] = useState(false);

  const dispatch = useDispatch();
  const { pendingVerification } = useSelector((state: RootState) => state.auth);
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const { t } = useLanguage();

  const validateForm = () => {
    if (!otp.trim()) {
      Toast.show({
        type: 'error',
        text1: t.common.error,
        text2: t.auth.validation.otpRequired,
      });
      return false;
    }
    if (otp.length !== 4) {
      Toast.show({
        type: 'error',
        text1: t.common.error,
        text2: t.auth.validation.otpLength,
      });
      return false;
    }
    if (!pendingVerification.email) {
      Toast.show({
        type: 'error',
        text1: t.common.error,
        text2: t.auth.validation.noPendingVerification,
      });
      return false;
    }
    return true;
  };

  const handleVerify = async () => {
    if (!validateForm()) return;

    try {
      await verifyOTP({
        email: pendingVerification.email!,
        otp: otp.trim(),
      }).unwrap();

      dispatch(clearPendingVerification());
      setVerified(true);

      Toast.show({
        type: 'success',
        text1: t.auth.otpVerifiedSuccess,
        text2: t.auth.accountVerified,
      });

      setTimeout(() => router.push('/'), 1000);
    } catch (error: any) {
      const errorMessage = error?.data?.message || t.auth.otpVerificationFailed;
      dispatch(setError(errorMessage));
      Toast.show({
        type: 'error',
        text1: t.auth.verificationFailed,
        text2: errorMessage,
      });
    }
  };

  const handleResend = () => {
    setResent(true);
    Toast.show({
      type: 'info',
      text1: t.auth.otpResent,
      text2: t.auth.newOtpSent,
    });
    setTimeout(() => setResent(false), 2000);
  };


  return (
    <AuthLayout 
      title={t.auth.otpVerification} 
      subtitle={t.auth.otpSubtitle}
    >
      <FormInput
        label={t.auth.otpCode}
        placeholder={t.auth.enterOtp}
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={4}
        editable={!verified}
        style={{ letterSpacing: 6, textAlign: 'center', fontSize: 20, fontWeight: '600' }}
      />

      <GradientButton
        title={verified ? t.auth.verified : isLoading ? t.auth.verifying : t.auth.verify}
        onPress={handleVerify}
        disabled={isLoading || verified}
        loading={isLoading}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        <Text>{t.auth.didNotReceiveCode}</Text>
        <LinkText
          linkText={resent ? t.auth.otpSent : t.auth.resendOtp}
          onPress={handleResend}
          disabled={resent}
          style={[{ marginLeft: 5 }, resent ? { opacity: 0.5 } : undefined]}
        />
      </View>

      <LinkText
        prefix={t.auth.backTo}
        linkText={t.auth.login}
        onPress={() => router.push('/(auth)/login')}
      />
    </AuthLayout>
  );
}