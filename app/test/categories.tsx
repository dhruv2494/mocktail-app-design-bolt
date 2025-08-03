import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, FolderOpen, Play, Users, Clock, AlertCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { useGetCategoriesQuery, Category } from '@/store/api/hierarchicalTestApi';

export default function CategoriesScreen() {
  const { seriesId, seriesUuid, seriesTitle } = useLocalSearchParams();

  const { isDarkMode } = useTheme();
  const { t, language } = useLanguage();
  const Colors = getTheme(isDarkMode);

  // Use the hierarchical API
  const {
    data: categoriesData,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useGetCategoriesQuery(seriesUuid as string, {
    skip: !seriesUuid,
  });

  const categories = categoriesData?.data || [];

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/test/sub-categories',
      params: {
        categoryId: category.id,
        categoryUuid: category.uuid,
        categoryTitle: language === 'gujarati' ? category.name_gujarati : category.name,
        seriesTitle,
        seriesUuid,
      },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderCategory = (category: Category) => {
    const title = language === 'gujarati' ? category.name_gujarati : category.name;
    const description = language === 'gujarati' ? category.description_gujarati : category.description;

    return (
      <TouchableOpacity
        key={category.id}
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(category)}
      >
        <View style={styles.categoryHeader}>
          <View style={styles.iconContainer}>
            <FolderOpen size={24} color={Colors.primary} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryTitle}>{title}</Text>
            {description && (
              <Text style={styles.categoryDescription}>{description}</Text>
            )}
          </View>
        </View>

        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <FolderOpen size={16} color={Colors.textSubtle} />
            <Text style={styles.statText}>
              {category.sub_categories_count} {t.categories?.subCategories || 'Sub-categories'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Play size={16} color={Colors.textSubtle} />
            <Text style={styles.statText}>
              {category.tests_count} {t.categories?.tests || 'Tests'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonLoader = () => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <SkeletonLoader width={48} height={48} style={styles.iconContainer} />
        <View style={styles.categoryInfo}>
          <SkeletonLoader width="70%" height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="90%" height={16} />
        </View>
      </View>
      <View style={styles.categoryStats}>
        <SkeletonLoader width={100} height={16} />
        <SkeletonLoader width={80} height={16} />
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
          <Text style={styles.headerTitle}>{t.categories?.title || 'Categories'}</Text>
          <Text style={styles.headerSubtitle}>{seriesTitle}</Text>
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
              {(error as any)?.data?.message || (error as any)?.message || 'Failed to load categories'}
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
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FolderOpen size={48} color={Colors.textSubtle} />
            <Text style={styles.emptyTitle}>{t.categories?.empty || 'No categories available'}</Text>
            <Text style={styles.emptyMessage}>
              {t.categories?.emptyMessage || 'Categories will appear here when they are added.'}
            </Text>
          </View>
        ) : (
          categories.map((category) => renderCategory(category))
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
  categoryCard: {
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
  categoryHeader: {
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
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.textSubtle,
    lineHeight: 20,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
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