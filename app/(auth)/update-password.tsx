import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme';
import logo from '@/assets/images/MockTale.jpg';
import { router } from 'expo-router';

export default function UpdatePasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  const handleUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUpdated(true);
    }, 1500);
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
            <Text style={styles.title}>Update Password</Text>
            <Text style={styles.subtitle}>Enter your new password below</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor={Colors.textSubtle || '#999'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!updated}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={Colors.textSubtle || '#999'}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!updated}
            />

            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
              disabled={loading || updated || !password || password !== confirmPassword}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.updateGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.updateButtonText}>
                  {updated ? 'Updated!' : loading ? 'Updating...' : 'Update Password'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

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
  },
  updateButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
  updateGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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