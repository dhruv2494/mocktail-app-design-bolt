import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Star, Clock, Users, Play, Lock, CircleCheck as CheckCircle, ShoppingCart, Gift, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetTestSeriesQuery, useGetTestSeriesCategoriesQuery, useGetTestSeriesStatsQuery, TestSeries } from '@/store/api/testSeriesApi';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

export default function TestSeriesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const Colors = getTheme(isDarkMode);

  // API calls
  const {
    data: seriesData,
    error: seriesError,
    isLoading: seriesLoading,
    refetch: refetchSeries,
  } = useGetTestSeriesQuery({
    page,
    limit: 20,
    search: searchQuery,
    category: selectedCategory || undefined,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useGetTestSeriesCategoriesQuery();

  const {
    data: statsData,
    isLoading: statsLoading,
  } = useGetTestSeriesStatsQuery();

  // Prepare categories with "All" option
  const categories = [
    { key: '', label: t.testSeries.categories.all },
    ...(categoriesData?.data?.map(cat => ({
      key: cat.name,
      label: cat.name,
    })) || []),
  ];

  const testSeries = seriesData?.data || [];
  const pagination = seriesData?.pagination;

  const handlePurchase = (series: TestSeries) => {
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

  const handleStartTest = (series: TestSeries) => {
    if (series.is_purchased) {
      router.push({
        pathname: '/test/quiz',
        params: {
          seriesId: series.id,
          testType: 'series',
          title: series.title,
        },
      });
    } else {
      // Start free test if available
      router.push({
        pathname: '/test/quiz',
        params: {
          seriesId: series.id,
          testType: 'series-free',
          title: `${series.title} - Free Trial`,
        },
      });
    }
  };

  const renderErrorState = () => (
    <View style={[styles.centerContainer, { paddingTop: 60 }]}>
      <AlertCircle size={48} color={Colors.danger} />
      <Text style={[styles.errorTitle, { color: Colors.textPrimary }]}>
        {t.common.error || 'Something went wrong'}
      </Text>
      <Text style={[styles.errorMessage, { color: Colors.textSubtle }]}>
        {t.common.tryAgain || 'Please try again later'}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: Colors.primary }]}
        onPress={refetchSeries}
      >
        <Text style={styles.retryButtonText}>{t.common.retry || 'Retry'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={[styles.centerContainer, { paddingTop: 60 }]}>
      <ShoppingCart size={48} color={Colors.textSubtle} />
      <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>
        {t.testSeries.noSeries || 'No test series available'}
      </Text>
      <Text style={[styles.emptyMessage, { color: Colors.textSubtle }]}>
        {t.testSeries.checkBackLater || 'Check back later for new series'}
      </Text>
    </View>
  );

  const styles = getStyles(Colors);

  // Show error state if there's an error
  if (seriesError) {
    return (
      <SafeAreaView style={styles.container}>
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.testSeries.title}</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSubtle} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.testSeries.searchPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categoriesLoading ? (
          // Show skeleton loaders for categories
          Array.from({ length: 5 }).map((_, index) => (
            <SkeletonLoader key={index} width={100} height={32} style={styles.categorySkeleton} />
          ))
        ) : (
          categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryChip,
                selectedCategory === category.key && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.key && styles.categoryTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Test Series List */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={seriesLoading}
            onRefresh={refetchSeries}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {seriesLoading ? (
          // Show skeleton loaders for test series
          Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.seriesCard}>
              <SkeletonLoader width="70%" height={20} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="100%" height={16} style={{ marginBottom: 16 }} />
              <View style={styles.statsContainer}>
                <SkeletonLoader width={80} height={16} />
                <SkeletonLoader width={80} height={16} />
                <SkeletonLoader width={80} height={16} />
              </View>
              <SkeletonLoader width="100%" height={48} style={{ marginTop: 16, borderRadius: 12 }} />
            </View>
          ))
        ) : testSeries.length === 0 ? (
          renderEmptyState()
        ) : (
          testSeries.map((series) => (
            <View key={series.id} style={styles.seriesCard}>
            {/* Header */}
            <View style={styles.seriesHeader}>
              <View style={styles.seriesHeaderLeft}>
                <Text style={styles.seriesTitle}>{series.title}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={14} color={Colors.warning} fill={Colors.warning} />
                  <Text style={styles.rating}>{series.rating || 0}</Text>
                  <Text style={styles.studentsCount}>({series.purchase_count || 0} {t.testSeries.students})</Text>
                </View>
              </View>
              {series.is_purchased && (
                <View style={styles.purchasedBadge}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.purchasedText}>{t.testSeries.purchased}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text style={styles.seriesDescription}>{series.description}</Text>

            {/* Topics */}
            <View style={styles.topicsContainer}>
              {series.topics?.slice(0, 3).map((topic, index) => (
                <View key={index} style={styles.topicChip}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              )) || (
                <View style={styles.topicChip}>
                  <Text style={styles.topicText}>{series.category}</Text>
                </View>
              )}
              {series.topics?.length > 3 && (
                <Text style={styles.moreTopics}>+{series.topics.length - 3} {t.testSeries.more}</Text>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Clock size={16} color={Colors.textSubtle} />
                <Text style={styles.statText}>{series.duration_months} {t.testSeries.months || 'months'}</Text>
              </View>
              <View style={styles.statItem}>
                <Play size={16} color={Colors.textSubtle} />
                <Text style={styles.statText}>{series.total_tests} {t.testSeries.tests}</Text>
              </View>
              <View style={styles.statItem}>
                <Gift size={16} color={Colors.textSubtle} />
                <Text style={styles.statText}>{series.free_tests} {t.testSeries.freeLabel}</Text>
              </View>
            </View>

            {/* Price and Action */}
            <View style={styles.actionContainer}>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{series.price}</Text>
                <Text style={styles.originalPrice}>₹{series.original_price}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round((1 - series.price / series.original_price) * 100)}% {t.testSeries.off}
                  </Text>
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                {series.free_tests > 0 && (
                  <TouchableOpacity 
                    style={styles.freeTestButton}
                    onPress={() => handleStartTest(series)}
                  >
                    <Text style={styles.freeTestText}>{t.testSeries.tryFree}</Text>
                  </TouchableOpacity>
                )}
                
                {series.is_purchased ? (
                  <TouchableOpacity 
                    style={styles.startButton}
                    onPress={() => handleStartTest(series)}
                  >
                    <Text style={styles.startButtonText}>{t.testSeries.startTests}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.purchaseButton}
                    onPress={() => handlePurchase(series)}
                  >
                    <Lock size={16} color={Colors.white} />
                    <Text style={styles.purchaseButtonText}>{t.testSeries.purchase}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            </View>
          ))
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
    maxHeight: 60,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryLight,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSubtle,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  seriesCard: {
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
  seriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  seriesHeaderLeft: {
    flex: 1,
  },
  seriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  studentsCount: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginLeft: 4,
  },
  purchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.badgeSuccessBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  purchasedText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  seriesDescription: {
    fontSize: 14,
    color: Colors.textSubtle,
    lineHeight: 20,
    marginBottom: 12,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  topicChip: {
    backgroundColor: Colors.chip,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 12,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  moreTopics: {
    fontSize: 12,
    color: Colors.textSubtle,
    fontStyle: 'italic',
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
    fontSize: 12,
    color: Colors.textSubtle,
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: -4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.textSubtle,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: Colors.badgeDangerBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountText: {
    fontSize: 10,
    color: Colors.danger,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  freeTestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  freeTestText: {
    fontSize: 14,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  purchaseButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  startButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categorySkeleton: {
    borderRadius: 16,
    marginRight: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
