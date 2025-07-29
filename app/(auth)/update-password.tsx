import React, { useState } from 'react';
import { router } from 'expo-router';
import { useResetPasswordMutation } from '@/store/api/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearPendingVerification } from '@/store/slices/authSlice';
import { AuthLayout, FormInput, GradientButton, LinkText } from '@/components/shared';
import { useFormValidation } from '@/hooks/auth/useFormValidation';
import { useAuthAPI } from '@/hooks/auth/useAuthAPI';
import { showError } from '@/utils/toast';

export default function UpdatePasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updated, setUpdated] = useState(false);

  const dispatch = useDispatch();
  const { pendingVerification } = useSelector((state: RootState) => state.auth);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { executeAPI } = useAuthAPI();

  const { validateForm } = useFormValidation({
    password: { type: 'password' },
    confirmPassword: { type: 'confirmPassword', compareField: 'password' },
  });

  const handleUpdate = async () => {
    if (!pendingVerification.email) {
      showError('Error', 'No reset session found. Please try again.');
      router.push('/(auth)/forgot-password');
      return;
    }

    const formData = { password, confirmPassword };
    if (!validateForm(formData)) return;

    await executeAPI(
      () => resetPassword({
        email: pendingVerification.email!,
        newPassword: password,
      }).unwrap(),
      {
        successMessage: 'Password Updated Successfully',
        errorMessage: 'Failed to update password',
        onSuccess: () => {
          dispatch(clearPendingVerification());
          setUpdated(true);
          setTimeout(() => router.push('/(auth)/login'), 1500);
        },
      }
    );
  };

  return (
    <AuthLayout
      title="Update Password"
      subtitle="Enter your new password below"
    >
      <FormInput
        label="New Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter new password"
        secureTextEntry
        editable={!updated}
      />

      <FormInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        secureTextEntry
        editable={!updated}
      />

      <GradientButton
        title={updated ? 'Updated!' : 'Update Password'}
        onPress={handleUpdate}
        loading={isLoading}
        disabled={updated || !password || password !== confirmPassword}
      />

      <LinkText
        prefix="Back to"
        text="Login"
        onPress={() => router.push('/(auth)/login')}
      />
    </AuthLayout>
  );
}