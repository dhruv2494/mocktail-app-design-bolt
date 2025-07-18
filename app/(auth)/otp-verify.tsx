import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme';
import logo from '@/assets/images/MockTale.jpg';
import { router } from 'expo-router';

export default function OtpVerifyScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      router.push('/(auth)/update-password');
    }, 1500);
  };

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Logo/Avatar */}
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.avatar} />
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>Enter the code sent to your email</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>OTP Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor={Colors.textSubtle || '#999'}
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              editable={!verified}
            />

            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerify}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.verifyGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.verifyButtonText}>
                  {verified ? 'Verified!' : loading ? 'Verifying...' : 'Verify'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text>Didn't receive code?</Text>
              <TouchableOpacity onPress={handleResend} disabled={resent}>
                <Text style={[styles.resendText, resent && { opacity: 0.5 }]}>Resend OTP</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.subRoute}>
              <Text>Back to</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.subRouteText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSubtle,
    marginBottom: 8,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 8,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: Colors.background,
    color: Colors.textPrimary,
    letterSpacing: 6,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  verifyButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
  verifyGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 5,
  },
  resendText: {
    color: Colors.textLink,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 5,
  },
  subRoute: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subRouteText: {
    color: Colors.textLink,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
});