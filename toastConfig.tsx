import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ToastConfig, BaseToastProps } from 'react-native-toast-message';
import { Colors } from './theme';

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }: BaseToastProps) => (
    <View style={[styles.toastContainer, { borderLeftColor: Colors.success }]}>
      {!!text1 && <Text style={styles.toastTitle}>{text1}</Text>}
      {!!text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
  error: ({ text1, text2 }: BaseToastProps) => (
    <View style={[styles.toastContainer, { borderLeftColor: Colors.danger }]}>
      {!!text1 && <Text style={styles.toastTitle}>{text1}</Text>}
      {!!text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
  info: ({ text1, text2 }: BaseToastProps) => (
    <View style={[styles.toastContainer, { borderLeftColor: Colors.accent }]}>
      {!!text1 && <Text style={styles.toastTitle}>{text1}</Text>}
      {!!text2 && <Text style={styles.toastMessage}>{text2}</Text>}
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderLeftWidth: 6,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  toastTitle: {
    fontWeight: 'bold',
    color: Colors.textPrimary,
    fontSize: 16,
  },
  toastMessage: {
    color: Colors.textSubtle,
    fontSize: 14,
    marginTop: 4,
  },
});
