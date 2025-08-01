import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Search, Crown, Lock, Unlock, Star } from 'lucide-react-native';
import { useGetTestSeriesQuery, TestSeries } from '@/store/api/testApi';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTheme } from '@/theme';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

export default function TestSeriesScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const Colors = getTheme(isDarkMode);

  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [page, setPage] = useState(1);

  const {
    data: testSeriesData,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetTestSeriesQuery({
    page,
    limit: 10,
    search: searchText,
    pricing_type: selectedFilter === 'all' ? undefined : selectedFilter,
    is_featured: undefined,
  });

  const handleRefresh = () => {
    setPage(1);
    refetch();
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    setPage(1);
  };

  const handleFilterChange = (filter: 'all' | 'free' | 'paid') => {
    setSelectedFilter(filter);
    setPage(1);
  };

  const handleTestSeriesPress = (testSeries: TestSeries) => {
    if (testSeries.pricing_type === 'paid' && !testSeries.is_subscribed) {
      Alert.alert(
        t.testSeries.subscriptionRequired,
        `${t.testSeries.subscriptionRequiredMessage} ${testSeries.price} ${testSeries.currency}`,
        [
          { text: t.common.cancel, style: 'cancel' },
          {
            text: t.testSeries.subscribe,
            onPress: () => router.push(`/payment?testSeriesId=${testSeries.uuid}`),
          },
        ]
      );
      return;
    }

    router.push(`/test-series/${testSeries.uuid}/categories`);
  };

  const renderTestSeriesCard = ({ item }: { item: TestSeries }) => {
    const title = currentLanguage === 'gu' && item.title_gujarati 
      ? item.title_gujarati 
      : item.title;
    
    const description = currentLanguage === 'gu' && item.description_gujarati 
      ? item.description_gujarati 
      : item.description;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}
        onPress={() => handleTestSeriesPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <BookOpen size={20} color={Colors.primary} />
            <Text style={[styles.cardTitle, { color: Colors.text }]} numberOfLines={2}>
              {title}
            </Text>
          </View>
          
          <View style={styles.badges}>
            {item.is_featured && (
              <View style={[styles.badge, styles.featuredBadge]}>
                <Star size={12} color="#FFD700" />
                <Text style={styles.featuredText}>{t.testSeries.featured}</Text>
              </View>
            )}
            
            <View style={[
              styles.badge,
              item.pricing_type === 'free' 
                ? styles.freeBadge 
                : styles.paidBadge
            ]}>
              {item.pricing_type === 'free' ? (
                <Unlock size={12} color="#10B981" />
              ) : (
                <Lock size={12} color="#F59E0B" />
              )}
              <Text style={[
                styles.badgeText,
                item.pricing_type === 'free' 
                  ? styles.freeText 
                  : styles.paidText
              ]}>
                {item.pricing_type === 'free' 
                  ? t.testSeries.free 
                  : `${item.price} ${item.currency}`
                }
              </Text>
            </View>
          </View>
        </View>

        {description && (
          <Text style={[styles.cardDescription, { color: Colors.textSecondary }]} numberOfLines={3}>
            {description}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.statsContainer}>
            <Text style={[styles.statsText, { color: Colors.textSecondary }]}>
              {item.categories_count || 0} {t.testSeries.categories}
            </Text>
            <Text style={[styles.statsText, { color: Colors.textSecondary }]}>
              {item.tests_count || 0} {t.testSeries.tests}
            </Text>
          </View>

          {item.pricing_type === 'paid' && item.demo_tests_count && (
            <Text style={[styles.demoText, { color: Colors.primary }]}>
              {item.demo_tests_count} {t.testSeries.demoTests}
            </Text>
          )}

          {item.pricing_type === 'paid' && item.is_subscribed && (
            <View style={[styles.badge, styles.subscribedBadge]}>
              <Crown size={12} color="#10B981" />
              <Text style={[styles.badgeText, styles.subscribedText]}>
                {t.testSeries.subscribed}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <BookOpen size={64} color={Colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: Colors.text }]}>
        {t.testSeries.noTestSeries}
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: Colors.textSecondary }]}>
        {t.testSeries.noTestSeriesMessage}
      </Text>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {(['all', 'free', 'paid'] as const).map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            selectedFilter === filter && styles.filterButtonActive,
            { 
              backgroundColor: selectedFilter === filter ? Colors.primary : Colors.cardBackground,
              borderColor: Colors.border 
            }
          ]}
          onPress={() => handleFilterChange(filter)}
        >
          <Text style={[
            styles.filterButtonText,
            { color: selectedFilter === filter ? '#fff' : Colors.text }
          ]}>
            {filter === 'all' ? t.common.all : 
             filter === 'free' ? t.testSeries.free : t.testSeries.paid}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.text }]}>
            {t.navigation.testSeries}
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
          <Text style={[styles.title, { color: Colors.text }]}>
            {t.navigation.testSeries}
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>
          {t.navigation.testSeries}
        </Text>
        
        <View style={[styles.searchContainer, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: Colors.text }]}
            placeholder={t.testSeries.searchPlaceholder}
            placeholderTextColor={Colors.textSecondary}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        {renderFilterButtons()}
      </View>

      <FlatList
        data={testSeriesData?.data || []}
        renderItem={renderTestSeriesCard}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonActive: {},
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredBadge: {
    backgroundColor: '#FEF3C7',
  },
  freeBadge: {
    backgroundColor: '#D1FAE5',
  },
  paidBadge: {
    backgroundColor: '#FEF3C7',
  },
  subscribedBadge: {
    backgroundColor: '#D1FAE5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  featuredText: {
    color: '#D97706',
  },
  freeText: {
    color: '#065F46',
  },
  paidText: {
    color: '#92400E',
  },
  subscribedText: {
    color: '#065F46',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  demoText: {
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