import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, FileText, Play, Clock, Users, Target, CheckCircle, Lock, AlertCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { useGetTestsQuery, Test } from '@/store/api/hierarchicalTestApi';

export default function TestsScreen() {
  const { subCategoryId, subCategoryUuid, subCategoryTitle, categoryTitle, seriesTitle, seriesUuid } = useLocalSearchParams();

  const { isDarkMode } = useTheme();
  const { t, language } = useLanguage();
  const Colors = getTheme(isDarkMode);

  // Use the hierarchical API
  const {
    data: testsData,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useGetTestsQuery(subCategoryUuid as string, {
    skip: !subCategoryUuid,
  });

  const tests = testsData?.data || [];

  const handleTestPress = (test: Test) => {
    // Navigate to quiz screen with test details
    router.push({
      pathname: '/test/quiz',
      params: {
        testId: test.id,
        testUuid: test.uuid,
        testTitle: language === 'gujarati' ? test.name_gujarati : test.name,
        subCategoryTitle,
        categoryTitle,
        seriesTitle,
        seriesUuid,
        duration: test.duration_minutes,
        totalQuestions: test.questions_count,
        isDemo: test.is_demo,
      },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return Colors.success;
      case 'medium':
        return Colors.warning;
      case 'hard':
        return Colors.danger;
      default:
        return Colors.textSubtle;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return t.tests?.difficultyEasy || 'Easy';
      case 'medium':
        return t.tests?.difficultyMedium || 'Medium';
      case 'hard':
        return t.tests?.difficultyHard || 'Hard';
      default:
        return difficulty;
    }
  };

  const renderTest = (test: Test) => {
    const title = language === 'gujarati' ? test.name_gujarati : test.name;
    const description = language === 'gujarati' ? test.description_gujarati : test.description;
    const canAttempt = !test.max_attempts || test.user_attempts < test.max_attempts;

    return (
      <TouchableOpacity
        key={test.id}
        style={[styles.testCard, !canAttempt && styles.testCardDisabled]}
        onPress={() => canAttempt && handleTestPress(test)}
        disabled={!canAttempt}
      >
        <View style={styles.testHeader}>
          <View style={styles.testTitleContainer}>
            <View style={styles.iconContainer}>
              <FileText size={24} color={Colors.primary} />
            </View>
            <View style={styles.testInfo}>
              <Text style={styles.testTitle}>{title}</Text>
              {description && (
                <Text style={styles.testDescription}>{description}</Text>
              )}
            </View>
          </View>
          
          {test.is_demo && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoText}>{t.tests?.demo || 'Demo'}</Text>
            </View>
          )}
        </View>

        <View style={styles.testDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Clock size={16} color={Colors.textSubtle} />
              <Text style={styles.detailText}>{test.duration_minutes} {t.tests?.minutes || 'min'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Target size={16} color={Colors.textSubtle} />
              <Text style={styles.detailText}>{test.questions_count} {t.tests?.questions || 'Q'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={16} color={Colors.textSubtle} />
              <Text style={styles.detailText}>{test.total_marks} {t.tests?.marks || 'marks'}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(test.difficulty_level) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(test.difficulty_level) }]}>
                {getDifficultyLabel(test.difficulty_level)}
              </Text>
            </View>
            
            {test.negative_marking && (
              <View style={styles.negativeBadge}>
                <Text style={styles.negativeText}>
                  -{test.negative_marks} {t.tests?.negativeMarks || 'for wrong'}
                </Text>
              </View>
            )}
          </View>

          {test.user_attempts > 0 && (
            <View style={styles.attemptInfo}>
              <CheckCircle size={16} color={Colors.success} />
              <Text style={styles.attemptText}>
                {t.tests?.attempted || 'Attempted'} {test.user_attempts} 
                {test.max_attempts ? `/${test.max_attempts}` : ''} {t.tests?.times || 'times'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.testAction}>
          {canAttempt ? (
            <View style={styles.startButton}>
              <Play size={16} color={Colors.white} />
              <Text style={styles.startButtonText}>
                {test.user_attempts > 0 ? (t.tests?.retake || 'Retake') : (t.tests?.start || 'Start Test')}
              </Text>
            </View>
          ) : (
            <View style={styles.disabledButton}>
              <Lock size={16} color={Colors.textSubtle} />
              <Text style={styles.disabledButtonText}>{t.tests?.maxAttemptsReached || 'Max attempts reached'}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonLoader = () => (
    <View style={styles.testCard}>
      <View style={styles.testHeader}>
        <View style={styles.testTitleContainer}>
          <SkeletonLoader width={48} height={48} style={styles.iconContainer} />
          <View style={styles.testInfo}>
            <SkeletonLoader width="80%" height={20} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="100%" height={16} />
          </View>
        </View>
      </View>
      <View style={styles.testDetails}>
        <View style={styles.detailRow}>
          <SkeletonLoader width={60} height={16} />
          <SkeletonLoader width={50} height={16} />
          <SkeletonLoader width={70} height={16} />
        </View>
        <View style={styles.metaRow}>
          <SkeletonLoader width={80} height={24} />
          <SkeletonLoader width={100} height={24} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={48} style={{ borderRadius: 8 }} />
    </View>
  );

  const styles = getStyles(Colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t.tests?.title || 'Tests'}</Text>
          <Text style={styles.headerSubtitle}>{subCategoryTitle}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color={Colors.danger} />
            <Text style={styles.errorText}>
              {(error as any)?.data?.message || (error as any)?.message || 'Failed to load tests'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>{t.common?.retry || 'Retry'}</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <React.Fragment key={index}>
              {renderSkeletonLoader()}
            </React.Fragment>
          ))
        ) : tests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={48} color={Colors.textSubtle} />
            <Text style={styles.emptyTitle}>{t.tests?.empty || 'No tests available'}</Text>
            <Text style={styles.emptyMessage}>
              {t.tests?.emptyMessage || 'Tests will appear here when they are added.'}
            </Text>
          </View>
        ) : (
          tests.map((test) => renderTest(test))
        )}
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSubtle,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  testCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testCardDisabled: {
    opacity: 0.6,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  testTitleContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: Colors.textSubtle,
    lineHeight: 20,
  },
  demoBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  demoText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  testDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSubtle,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  negativeBadge: {
    backgroundColor: Colors.danger + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  negativeText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '500',
  },
  attemptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.muted,
  },
  attemptText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  testAction: {
    marginTop: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.muted,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  disabledButtonText: {
    color: Colors.textSubtle,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 20,
  },
});