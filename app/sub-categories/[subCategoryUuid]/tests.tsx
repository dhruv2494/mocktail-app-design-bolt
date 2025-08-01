import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, FileText, Clock, Award, Play, Lock, CheckCircle } from 'lucide-react-native';
import { useGetTestsBySubCategoryQuery, useGetSubCategoryByIdQuery, Test } from '@/store/api/testApi';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTheme } from '@/theme';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

export default function TestsScreen() {
  const router = useRouter();
  const { subCategoryUuid } = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const Colors = getTheme(isDarkMode);

  const {
    data: subCategoryData,
    isLoading: subCategoryLoading,
  } = useGetSubCategoryByIdQuery(subCategoryUuid as string);

  const {
    data: testsData,
    isLoading: testsLoading,
    isFetching,
    refetch,
    error,
  } = useGetTestsBySubCategoryQuery(subCategoryUuid as string);

  const handleRefresh = () => {
    refetch();
  };

  const handleTestPress = (test: Test) => {
    // Check if test is locked (paid and user doesn't have access)
    if (!test.is_demo && test.user_attempts !== undefined && test.user_attempts >= (test.max_attempts || 1)) {
      Alert.alert(
        t.tests.attemptsExhausted,
        t.tests.attemptsExhaustedMessage,
        [{ text: t.common.ok }]
      );
      return;
    }

    // Navigate to quiz screen
    router.push(`/quiz/${test.uuid}`);
  };

  const handleBack = () => {
    router.back();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return Colors.textSecondary;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return t.tests.difficulty.easy;
      case 'medium':
        return t.tests.difficulty.medium;
      case 'hard':
        return t.tests.difficulty.hard;
      default:
        return difficulty;
    }
  };

  const renderTestCard = ({ item }: { item: Test }) => {
    const title = currentLanguage === 'gu' && item.title_gujarati 
      ? item.title_gujarati 
      : item.title;
    
    const description = currentLanguage === 'gu' && item.description_gujarati 
      ? item.description_gujarati 
      : item.description;

    const isAttempted = item.user_attempts !== undefined && item.user_attempts > 0;
    const isExhausted = item.user_attempts !== undefined && item.user_attempts >= (item.max_attempts || 1);
    const canAttempt = !isExhausted;

    return (
      <TouchableOpacity
        style={[
          styles.card, 
          { 
            backgroundColor: Colors.cardBackground, 
            borderColor: isExhausted ? Colors.error + '30' : Colors.border,
            opacity: isExhausted ? 0.7 : 1
          }
        ]}
        onPress={() => handleTestPress(item)}
        activeOpacity={0.7}
        disabled={isExhausted}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <FileText size={24} color={Colors.primary} />
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.cardTitle, { color: Colors.text }]} numberOfLines={2}>
                {title}
              </Text>
              
              <View style={styles.badges}>
                {item.is_demo && (
                  <View style={[styles.badge, styles.demoBadge]}>
                    <Text style={[styles.badgeText, styles.demoText]}>
                      {t.tests.demo}
                    </Text>
                  </View>
                )}
                
                {isAttempted && (
                  <View style={[styles.badge, styles.attemptedBadge]}>
                    <CheckCircle size={12} color="#10B981" />
                    <Text style={[styles.badgeText, styles.attemptedText]}>
                      {t.tests.attempted}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {description && (
              <Text style={[styles.cardDescription, { color: Colors.textSecondary }]} numberOfLines={2}>
                {description}
              </Text>
            )}
            
            <View style={styles.metaContainer}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Clock size={16} color={Colors.textSecondary} />
                  <Text style={[styles.metaText, { color: Colors.textSecondary }]}>
                    {item.duration_minutes} {t.tests.minutes}
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Award size={16} color={Colors.textSecondary} />
                  <Text style={[styles.metaText, { color: Colors.textSecondary }]}>
                    {item.total_marks} {t.tests.marks}
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <FileText size={16} color={Colors.textSecondary} />
                  <Text style={[styles.metaText, { color: Colors.textSecondary }]}>
                    {item.questions_count || 0} {t.tests.questions}
                  </Text>
                </View>
              </View>
              
              <View style={styles.metaRow}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty_level) + '20' }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty_level) }]}>
                    {getDifficultyText(item.difficulty_level)}
                  </Text>
                </View>
                
                {item.max_attempts && (
                  <Text style={[styles.attemptsText, { color: Colors.textSecondary }]}>
                    {t.tests.attempts}: {item.user_attempts || 0}/{item.max_attempts}
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.actionContainer}>
            {isExhausted ? (
              <View style={[styles.lockContainer, { backgroundColor: Colors.error + '20' }]}>
                <Lock size={20} color={Colors.error} />
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: Colors.primary }]}
                onPress={() => handleTestPress(item)}
              >
                <Play size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {item.negative_marking && (
          <View style={styles.warningContainer}>
            <Text style={[styles.warningText, { color: Colors.warning }]}>
              ⚠️ {t.tests.negativeMarking}: -{item.negative_marks_per_question || 0.25} {t.tests.perWrong}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FileText size={64} color={Colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: Colors.text }]}>
        {t.tests.noTests}
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: Colors.textSecondary }]}>
        {t.tests.noTestsMessage}
      </Text>
    </View>
  );

  const isLoading = subCategoryLoading || testsLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: Colors.text }]}>
            {t.tests.title}
          </Text>
        </View>
        <SkeletonLoader />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: Colors.text }]}>
            {t.tests.title}
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors.error }]}>
            {t.common.errorMessage}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors.primary }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>{t.common.retry}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subCategory = subCategoryData?.data;
  const subCategoryTitle = currentLanguage === 'gu' && subCategory?.title_gujarati 
    ? subCategory.title_gujarati 
    : subCategory?.title;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: Colors.text }]}>
            {t.tests.title}
          </Text>
          {subCategoryTitle && (
            <Text style={[styles.subtitle, { color: Colors.textSecondary }]} numberOfLines={1}>
              {subCategoryTitle}
            </Text>
          )}
        </View>
      </View>

      <FlatList
        data={testsData?.data?.tests || []}
        renderItem={renderTestCard}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  demoBadge: {
    backgroundColor: '#E0F2FE',
  },
  attemptedBadge: {
    backgroundColor: '#D1FAE5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  demoText: {
    color: '#0369A1',
  },
  attemptedText: {
    color: '#065F46',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attemptsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});