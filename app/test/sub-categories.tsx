import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, BookOpen, Play, Clock, AlertCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { useGetSubCategoriesQuery, SubCategory } from '@/store/api/hierarchicalTestApi';

export default function SubCategoriesScreen() {
  const { categoryId, categoryUuid, categoryTitle, seriesTitle, seriesUuid } = useLocalSearchParams();

  const { isDarkMode } = useTheme();
  const { t, language } = useLanguage();
  const Colors = getTheme(isDarkMode);

  // Use the hierarchical API
  const {
    data: subCategoriesData,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useGetSubCategoriesQuery(categoryUuid as string, {
    skip: !categoryUuid,
  });

  const subCategories = subCategoriesData?.data || [];

  const handleSubCategoryPress = (subCategory: SubCategory) => {
    router.push({
      pathname: '/test/tests',
      params: {
        subCategoryId: subCategory.id,
        subCategoryUuid: subCategory.uuid,
        subCategoryTitle: language === 'gujarati' ? subCategory.name_gujarati : subCategory.name,
        categoryTitle,
        seriesTitle,
        seriesUuid,
      },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderSubCategory = (subCategory: SubCategory) => {
    const title = language === 'gujarati' ? subCategory.name_gujarati : subCategory.name;
    const description = language === 'gujarati' ? subCategory.description_gujarati : subCategory.description;

    return (
      <TouchableOpacity
        key={subCategory.id}
        style={styles.subCategoryCard}
        onPress={() => handleSubCategoryPress(subCategory)}
      >
        <View style={styles.subCategoryHeader}>
          <View style={styles.iconContainer}>
            <BookOpen size={24} color={Colors.primary} />
          </View>
          <View style={styles.subCategoryInfo}>
            <Text style={styles.subCategoryTitle}>{title}</Text>
            {description && (
              <Text style={styles.subCategoryDescription}>{description}</Text>
            )}
          </View>
        </View>

        <View style={styles.subCategoryStats}>
          <View style={styles.statItem}>
            <Play size={16} color={Colors.textSubtle} />
            <Text style={styles.statText}>
              {subCategory.tests_count} {t.subCategories?.tests || 'Tests'}
            </Text>
          </View>
        </View>

        <View style={styles.actionIndicator}>
          <Text style={styles.actionText}>{t.subCategories?.viewTests || 'View Tests'}</Text>
          <ChevronLeft size={16} color={Colors.textSubtle} style={{ transform: [{ rotate: '180deg' }] }} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonLoader = () => (
    <View style={styles.subCategoryCard}>
      <View style={styles.subCategoryHeader}>
        <SkeletonLoader width={48} height={48} style={styles.iconContainer} />
        <View style={styles.subCategoryInfo}>
          <SkeletonLoader width="70%" height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="90%" height={16} />
        </View>
      </View>
      <View style={styles.subCategoryStats}>
        <SkeletonLoader width={80} height={16} />
      </View>
      <View style={styles.actionIndicator}>
        <SkeletonLoader width={100} height={16} />
      </View>
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
          <Text style={styles.headerTitle}>{t.subCategories?.title || 'Sub-Categories'}</Text>
          <Text style={styles.headerSubtitle}>{categoryTitle}</Text>
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
              {(error as any)?.data?.message || (error as any)?.message || 'Failed to load sub-categories'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>{t.common?.retry || 'Retry'}</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <React.Fragment key={index}>
              {renderSkeletonLoader()}
            </React.Fragment>
          ))
        ) : subCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen size={48} color={Colors.textSubtle} />
            <Text style={styles.emptyTitle}>{t.subCategories?.empty || 'No sub-categories available'}</Text>
            <Text style={styles.emptyMessage}>
              {t.subCategories?.emptyMessage || 'Sub-categories will appear here when they are added.'}
            </Text>
          </View>
        ) : (
          subCategories.map((subCategory) => renderSubCategory(subCategory))
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
  subCategoryCard: {
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
  subCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  subCategoryInfo: {
    flex: 1,
  },
  subCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subCategoryDescription: {
    fontSize: 14,
    color: Colors.textSubtle,
    lineHeight: 20,
  },
  subCategoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.textSubtle,
    fontWeight: '500',
  },
  actionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.muted,
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary,
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