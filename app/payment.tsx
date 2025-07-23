import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CreditCard, Smartphone, Wallet, Shield, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthGuard } from '@/components/AuthGuard';

export default function PaymentScreen() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const Colors = getTheme(isDarkMode);
  const { seriesId } = useLocalSearchParams();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');

  // Sample series data - in real app, this would be fetched based on seriesId
  const seriesData = {
    id: 1,
    title: 'PSI Mock Test Series',
    price: 299,
    originalPrice: 499,
    tests: 10,
    freeTests: 2,
    duration: '3 months',
    description: 'Complete preparation for Police Sub Inspector exam with detailed solutions',
    discount: Math.round((1 - 299 / 499) * 100),
    features: [
      t.payment.features.fullLengthTests.replace('{count}', '10'),
      t.payment.features.freeTests.replace('{count}', '2'),
      t.payment.features.detailedSolutions,
      t.payment.features.performanceAnalytics,
      t.payment.features.multiLanguage,
      t.payment.features.validity.replace('{duration}', '3')
    ]
  };

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: t.payment.razorpayDesc,
      icon: CreditCard,
      recommended: true
    },
    {
      id: 'upi',
      name: t.payment.upi,
      description: t.payment.upiDesc,
      icon: Smartphone,
      recommended: false
    },
    {
      id: 'wallet',
      name: t.payment.digitalWallet,
      description: t.payment.walletDesc,
      icon: Wallet,
      recommended: false
    }
  ];

  const handlePayment = () => {
    // In real implementation, integrate with actual payment gateway
    Alert.alert(
      t.payment.gatewayIntegration,
      t.payment.integrationMessage.replace('{method}', selectedPaymentMethod).replace('{amount}', `₹${seriesData.price}`),
      [
        { text: t.common.cancel, style: 'cancel' },
        { 
          text: t.payment.simulateSuccess, 
          onPress: () => {
            Alert.alert(
              t.payment.paymentSuccess,
              t.payment.seriesAdded,
              [{ text: t.common.ok, onPress: () => router.back() }]
            );
          }
        }
      ]
    );
  };

  const styles = getStyles(Colors);

  return (
    <AuthGuard requireEmailVerification={true}>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.payment.purchaseTestSeries}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Series Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{seriesData.title}</Text>
          <Text style={styles.summaryDescription}>{seriesData.description}</Text>
          
          <View style={styles.featuresList}>
            {seriesData.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.priceCard}>
          <Text style={styles.priceCardTitle}>{t.payment.priceDetails}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t.payment.originalPrice}</Text>
            <Text style={styles.originalPrice}>₹{seriesData.originalPrice}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t.payment.discount} ({seriesData.discount}% {t.payment.off})</Text>
            <Text style={styles.discountAmount}>-₹{seriesData.originalPrice - seriesData.price}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>{t.payment.totalAmount}</Text>
            <Text style={styles.totalPrice}>₹{seriesData.price}</Text>
          </View>

          <View style={styles.savingsHighlight}>
            <Text style={styles.savingsText}>
              {t.payment.youSave.replace('{amount}', `₹${seriesData.originalPrice - seriesData.price}`)}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>{t.payment.selectPaymentMethod}</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodLeft}>
                <View style={[
                  styles.paymentIcon,
                  selectedPaymentMethod === method.id && styles.selectedPaymentIcon
                ]}>
                  <method.icon 
                    size={24} 
                    color={selectedPaymentMethod === method.id ? Colors.primary : Colors.textSubtle} 
                  />
                </View>
                <View>
                  <View style={styles.paymentMethodHeader}>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                    {method.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>{t.payment.recommended}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.paymentMethodDesc}>{method.description}</Text>
                </View>
              </View>
              
              <View style={[
                styles.radioButton,
                selectedPaymentMethod === method.id && styles.selectedRadioButton
              ]}>
                {selectedPaymentMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Shield size={20} color={Colors.success} />
          <Text style={styles.securityText}>
            {t.payment.securePayment}
          </Text>
        </View>

        {/* Payment Button */}
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handlePayment}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryLight]}
              style={styles.paymentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.paymentButtonText}>
                {t.payment.payNow.replace('{amount}', `₹${seriesData.price}`)}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.paymentNote}>
            {t.payment.termsNote}
          </Text>
        </View>
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  summaryDescription: {
    fontSize: 14,
    color: Colors.textSubtle,
    lineHeight: 20,
    marginBottom: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  priceCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  priceCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSubtle,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.textSubtle,
    textDecorationLine: 'line-through',
  },
  discountAmount: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.muted,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  savingsHighlight: {
    backgroundColor: Colors.success + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  savingsText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.muted,
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedPaymentIcon: {
    backgroundColor: Colors.primary + '20',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  recommendedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.success,
    borderRadius: 10,
  },
  recommendedText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '500',
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: Colors.textSubtle,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: Colors.textSubtle,
  },
  paymentButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  paymentButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  paymentGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  paymentNote: {
    fontSize: 12,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 16,
  },
});