import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Folder, ChevronRight } from 'lucide-react-native';
import { useGetSubCategoriesByCategoryQuery, useGetCategoryByIdQuery } from '@/store/api/testApi';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTheme } from '@/theme';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

export default function SubCategoriesScreen() {
  const router = useRouter();
  const { categoryUuid } = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const Colors = getTheme(isDarkMode);

  const {
    data: categoryData,
    isLoading: categoryLoading,
  } = useGetCategoryByIdQuery(categoryUuid as string);

  const {
    data: subCategoriesData,
    isLoading: subCategoriesLoading,
    isFetching,
    refetch,
    error,
  } = useGetSubCategoriesByCategoryQuery(categoryUuid as string);

  const handleRefresh = () => {
    refetch();
  };

  const handleSubCategoryPress = (subCategoryUuid: string) => {
    router.push(`/sub-categories/${subCategoryUuid}/tests`);
  };

  const handleBack = () => {
    router.back();
  };

  const renderSubCategoryCard = ({ item }: { item: any }) => {
    const title = currentLanguage === 'gu' && item.title_gujarati 
      ? item.title_gujarati 
      : item.title;
    
    const description = currentLanguage === 'gu' && item.description_gujarati 
      ? item.description_gujarati 
      : item.description;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}
        onPress={() => handleSubCategoryPress(item.uuid)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Folder size={24} color={Colors.primary} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.cardTitle, { color: Colors.text }]} numberOfLines={2}>
              {title}
            </Text>
            
            {description && (
              <Text style={[styles.cardDescription, { color: Colors.textSecondary }]} numberOfLines={2}>
                {description}
              </Text>
            )}
            
            <View style={styles.statsContainer}>
              <Text style={[styles.statsText, { color: Colors.textSecondary }]}>
                {item.tests_count || 0} {t.subCategories.tests}
              </Text>
            </View>
          </View>
          
          <ChevronRight size={20} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Folder size={64} color={Colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: Colors.text }]}>
        {t.subCategories.noSubCategories}
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: Colors.textSecondary }]}>
        {t.subCategories.noSubCategoriesMessage}
      </Text>
    </View>
  );

  const isLoading = categoryLoading || subCategoriesLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: Colors.text }]}>
            {t.subCategories.title}
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
            {t.subCategories.title}
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

  const category = categoryData?.data;
  const categoryTitle = currentLanguage === 'gu' && category?.title_gujarati 
    ? category.title_gujarati 
    : category?.title;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: Colors.text }]}>
            {t.subCategories.title}
          </Text>
          {categoryTitle && (
            <Text style={[styles.subtitle, { color: Colors.textSecondary }]} numberOfLines={1}>
              {categoryTitle}
            </Text>
          )}
        </View>
      </View>

      <FlatList
        data={subCategoriesData?.data?.subCategories || []}
        renderItem={renderSubCategoryCard}
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
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statsText: {
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