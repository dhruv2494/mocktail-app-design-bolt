import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useVerifyOTPMutation } from '@/store/api/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearPendingVerification } from '@/store/slices/authSlice';
import { AuthLayout, FormInput, GradientButton, LinkText } from '@/components/shared';
import { useLanguage } from '@/contexts/LanguageContext';
import { API_CONFIG } from '@/config/constants';
import { useFormValidation } from '@/hooks/auth/useFormValidation';
import { useAuthAPI } from '@/hooks/auth/useAuthAPI';
import { showSuccess, showError } from '@/utils/toast';

export default function OtpVerifyScreen() {
  const [otp, setOtp] = useState('');
  const [resent, setResent] = useState(false);
  const [verified, setVerified] = useState(false);

  const dispatch = useDispatch();
  const { pendingVerification } = useSelector((state: RootState) => state.auth);
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const { t } = useLanguage();
  const { executeAPI } = useAuthAPI();
  
  const { validateForm } = useFormValidation({
    otp: { type: 'otp' },
  });


  const handleVerify = async () => {
    // Check for pending verification email first
    if (!pendingVerification.email) {
      showError(t.common.error, t.auth.validation.noPendingVerification);
      return;
    }
    
    const formData = { otp: otp.trim() };
    if (!validateForm(formData)) return;

    await executeAPI(
      () => verifyOTP({
        email: pendingVerification.email!,
        otp: otp.trim(),
      }).unwrap(),
      {
        errorMessage: t.auth.otpVerificationFailed,
        onSuccess: () => {
          // Store the type before clearing verification state
          const verificationType = pendingVerification.type;
          
          setVerified(true);

          showSuccess(
            t.auth.otpVerifiedSuccess,
            verificationType === 'forgot-password' 
              ? 'OTP verified. You can now reset your password.' 
              : t.auth.accountVerified
          );

          // Redirect based on verification type
          if (verificationType === 'forgot-password') {
            // Don't clear verification for forgot password - update-password screen needs the email
            setTimeout(() => router.push('/(auth)/update-password'), 1000);
          } else {
            // For registration, clear verification and redirect to dashboard
            dispatch(clearPendingVerification());
            setTimeout(() => router.push('/'), 1000);
          }
        }
      }
    );
  };

  const handleResend = async () => {
    if (!pendingVerification.email) return;
    
    setResent(true);
    
    const apiCall = async () => {
      const endpoint = pendingVerification.type === 'forgot-password'
        ? '/api/users/forgotPassword'
        : '/api/users/resend-otp';
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email: pendingVerification.email })
      });
      
      if (!response.ok) {
        throw new Error('Failed to resend OTP');
      }
      
      return response.json();
    };
    
    await executeAPI(
      apiCall,
      {
        successMessage: t.auth.otpResent,
        errorMessage: 'Failed to resend OTP. Please try again.',
        onSuccess: () => {
          showSuccess(t.auth.otpResent, t.auth.newOtpSent);
        }
      }
    );
    
    setTimeout(() => setResent(false), 3000);
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