import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Clock, Play, Lock, Users, Gift, Award, BookOpen, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  useGetTestSeriesByIdQuery,
  useGetSeriesTestsQuery
} from '@/store/api/testSeriesApi';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import Toast from 'react-native-toast-message';

export default function SeriesDetailScreen() {
  const { seriesId, title } = useLocalSearchParams<{ seriesId: string; title: string }>();
  
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const Colors = getTheme(isDarkMode);

  // API calls using existing APIs
  const {
    data: seriesData,
    error: seriesError,
    isLoading: seriesLoading,
    refetch: refetchSeries,
  } = useGetTestSeriesByIdQuery(seriesId!, {
    skip: !seriesId,
  });

  const {
    data: testsData,
    isLoading: testsLoading,
    refetch: refetchTests,
  } = useGetSeriesTestsQuery(seriesId!, {
    skip: !seriesId,
  });

  const series = seriesData?.data;
  const tests = testsData?.data || [];

  const handleTestSelect = (testId: string, testTitle: string) => {
    // Find the test object to get the UUID
    const test = tests.find(t => t.id === testId);
    router.push({
      pathname: '/test/quiz',
      params: {
        testId: test?.uuid || testId, // Use UUID if available, fallback to ID
        title: testTitle,
        seriesId: seriesId!,
        seriesTitle: title!,
      },
    });
  };

  const handlePurchase = () => {
    if (!series) return;
    
    router.push({
      pathname: '/payment',
      params: {
        seriesId: series.id,
        title: series.title,
        price: series.price,
        type: 'test-series',
      },
    });
  };

  const handleStartFreeTest = () => {
    // Find a free test to start
    const freeTest = tests.find(test => test.is_free && !test.is_locked);
    if (freeTest) {
      handleTestSelect(freeTest.id, freeTest.title);
    } else {
      Toast.show({
        type: 'error',
        text1: 'No Free Tests Available',
        text2: 'No free tests are available in this series.',
      });
    }
  };

  const renderTestCard = (test: any, index: number) => (
    <TouchableOpacity
      key={test.id}
      style={[styles.categoryCard, test.is_locked && styles.lockedTestCard]}
      onPress={() => test.is_locked ? null : handleTestSelect(test.id, test.title)}
      disabled={test.is_locked}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: test.is_free ? Colors.success : Colors.primaryLight }]}>
          {test.is_locked ? (
            <Lock size={20} color={Colors.white} />
          ) : (
            <Play size={20} color={Colors.white} />
          )}
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: test.is_locked ? Colors.textSubtle : Colors.textPrimary }]}>
            {test.title}
          </Text>
          <View style={styles.categoryStats}>
            <Text style={[styles.categoryStatsText, { color: Colors.textSubtle }]}>
              {test.total_questions} questions • {test.duration} minutes
              {test.is_free && <Text style={{ color: Colors.success }}> • Free</Text>}
              {test.user_attempts > 0 && <Text> • Attempted {test.user_attempts} times</Text>}
            </Text>
          </View>
          {test.best_score && (
            <Text style={[styles.bestScore, { color: Colors.warning }]}>
              Best Score: {test.best_score}%
            </Text>
          )}
        </View>
        {!test.is_locked && <ChevronRight size={20} color={Colors.textSubtle} />}
      </View>
    </TouchableOpacity>
  );

  const styles = getStyles(Colors);

  if (seriesLoading || !series) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <SkeletonLoader width={150} height={20} />
          </View>
        </View>

        {/* Loading Content */}
        <ScrollView style={styles.content}>
          <View style={styles.seriesInfo}>
            <SkeletonLoader width="80%" height={28} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="100%" height={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader width="60%" height={16} style={{ marginBottom: 16 }} />
          </View>
          
          <View style={styles.categoriesSection}>
            <SkeletonLoader width={120} height={20} style={{ marginBottom: 16 }} />
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={styles.categoryCard}>
                <SkeletonLoader width="100%" height={60} style={{ borderRadius: 12 }} />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (seriesError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: Colors.textPrimary }]}>
            Failed to load test series
          </Text>
          <Text style={[styles.errorMessage, { color: Colors.textSubtle }]}>
            Please try again later
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors.primary }]}
            onPress={refetchSeries}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {series.name || series.title}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={seriesLoading || testsLoading}
            onRefresh={() => {
              refetchSeries();
              refetchTests();
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Series Information */}
        <View style={styles.seriesInfo}>
          <Text style={[styles.seriesTitle, { color: Colors.textPrimary }]}>
            {series.name || series.title}
          </Text>
          
          {series.description && (
            <Text style={[styles.seriesDescription, { color: Colors.textSubtle }]}>
              {series.description}
            </Text>
          )}

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Star size={16} color={Colors.warning} />
              <Text style={[styles.statText, { color: Colors.textSubtle }]}>
                {series.rating || 4.5} rating
              </Text>
            </View>
            <View style={styles.statItem}>
              <Users size={16} color={Colors.textSubtle} />
              <Text style={[styles.statText, { color: Colors.textSubtle }]}>
                {series.purchase_count || 0} enrolled
              </Text>
            </View>
            <View style={styles.statItem}>
              <Award size={16} color={Colors.textSubtle} />
              <Text style={[styles.statText, { color: Colors.textSubtle }]}>
                {series.difficulty_level}
              </Text>
            </View>
          </View>

          {/* Access Information */}
          <View style={styles.accessInfo}>
            {series.is_subscribed || series.is_purchased ? (
              <View style={[styles.accessBadge, { backgroundColor: Colors.badgeSuccessBg }]}>
                <Text style={[styles.accessText, { color: Colors.success }]}>
                  ✓ You have access to this series
                </Text>
              </View>
            ) : (
              <View style={[styles.accessBadge, { backgroundColor: Colors.badgeWarningBg }]}>
                <Text style={[styles.accessText, { color: Colors.warning }]}>
                  🔒 Purchase required for full access
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <View style={styles.priceContainer}>
              {series.pricing_type === 'free' || series.is_free ? (
                <Text style={[styles.price, { color: Colors.success }]}>Free</Text>
              ) : (
                <>
                  <Text style={[styles.price, { color: Colors.textPrimary }]}>
                    ₹{series.price}
                  </Text>
                  <Text style={[styles.currency, { color: Colors.textSubtle }]}>
                    {series.currency || 'INR'}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.buttonContainer}>
              {tests.some(test => test.is_free) && !(series.is_subscribed || series.is_purchased) && (
                <TouchableOpacity 
                  style={[styles.freeTestButton, { borderColor: Colors.primaryLight }]}
                  onPress={handleStartFreeTest}
                >
                  <Gift size={16} color={Colors.primaryLight} />
                  <Text style={[styles.freeTestText, { color: Colors.primaryLight }]}>
                    Try Free
                  </Text>
                </TouchableOpacity>
              )}

              {series.is_subscribed || series.is_purchased ? (
                <TouchableOpacity 
                  style={[styles.continueButton, { backgroundColor: Colors.success }]}
                  onPress={() => {
                    // Navigate to first available test
                    if (tests.length > 0) {
                      const firstTest = tests.find(test => !test.is_locked) || tests[0];
                      handleTestSelect(firstTest.id, firstTest.title);
                    }
                  }}
                >
                  <Text style={[styles.continueButtonText, { color: Colors.white }]}>
                    Continue Learning
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.purchaseButton, { backgroundColor: Colors.primaryLight }]}
                  onPress={handlePurchase}
                >
                  <Lock size={16} color={Colors.white} />
                  <Text style={[styles.purchaseButtonText, { color: Colors.white }]}>
                    Enroll Now
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Tests Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>
              Available Tests
            </Text>
            <Text style={[styles.sectionSubtitle, { color: Colors.textSubtle }]}>
              {tests.length} tests available
            </Text>
          </View>

          {testsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={styles.categoryCard}>
                <SkeletonLoader width="100%" height={60} style={{ borderRadius: 12 }} />
              </View>
            ))
          ) : tests.length === 0 ? (
            <View style={styles.emptyState}>
              <BookOpen size={48} color={Colors.textSubtle} />
              <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>
                No tests available
              </Text>
              <Text style={[styles.emptyMessage, { color: Colors.textSubtle }]}>
                Tests will be added soon
              </Text>
            </View>
          ) : (
            tests.map((test, index) => renderTestCard(test, index))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  seriesInfo: {
    padding: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  seriesTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  seriesDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    marginLeft: 4,
  },
  accessInfo: {
    marginBottom: 16,
  },
  accessBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  accessText: {
    fontSize: 14,
    fontWeight: '500',
  },
  demoText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  currency: {
    fontSize: 16,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  freeTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  freeTestText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  continueButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  categoriesSection: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  categoryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lockedTestCard: {
    opacity: 0.6,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryStats: {
    flexDirection: 'row',
  },
  categoryStatsText: {
    fontSize: 12,
  },
  bestScore: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});