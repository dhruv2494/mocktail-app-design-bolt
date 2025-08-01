import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  BookOpen, 
  Search, 
  Play, 
  Clock, 
  Award, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Filter,
  Users,
  Target,
  Star
} from 'lucide-react-native';
import { useGetFreeTestsQuery, useGetPYQsQuery } from '@/store/api/testApi';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTheme } from '@/theme';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

type TabType = 'free_tests' | 'pyqs';

interface PYQ {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  title_gujarati?: string;
  description_gujarati?: string;
  year: number;
  exam_type: string;
  questions_count: number;
  duration_minutes: number;
  total_marks: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  attempts_count?: number;
  user_attempts?: number;
}

export default function FreeTestsScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const Colors = getTheme(isDarkMode);

  const [activeTab, setActiveTab] = useState<TabType>('free_tests');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    year: 'all', // For PYQs
    exam_type: 'all', // For PYQs
  });

  // Free Tests Query
  const {
    data: freeTestsData,
    isLoading: freeTestsLoading,
    refetch: refetchFreeTests,
    isFetching: freeTestsFetching,
  } = useGetFreeTestsQuery({
    search: searchText,
    difficulty: filters.difficulty === 'all' ? undefined : filters.difficulty,
    category: filters.category === 'all' ? undefined : filters.category,
    limit: 20,
  });

  // PYQs Query
  const {
    data: pyqsData,
    isLoading: pyqsLoading,
    refetch: refetchPYQs,
    isFetching: pyqsFetching,
  } = useGetPYQsQuery({
    search: searchText,
    difficulty: filters.difficulty === 'all' ? undefined : filters.difficulty,
    year: filters.year === 'all' ? undefined : parseInt(filters.year),
    exam_type: filters.exam_type === 'all' ? undefined : filters.exam_type,
    limit: 20,
  });

  const handleRefresh = useCallback(() => {
    if (activeTab === 'free_tests') {
      refetchFreeTests();
    } else {
      refetchPYQs();
    }
  }, [activeTab, refetchFreeTests, refetchPYQs]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Colors.success;
      case 'medium': return Colors.warning;
      case 'hard': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Star;
      case 'medium': return Target;
      case 'hard': return TrendingUp;
      default: return Star;
    }
  };

  const handleTestPress = (testUuid: string, isFromPYQ: boolean = false) => {
    // Navigate to quiz screen
    router.push(`/quiz/${testUuid}${isFromPYQ ? '?source=pyq' : ''}`);
  };

  const renderTabHeader = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: activeTab === 'free_tests' ? Colors.primary : Colors.cardBackground,
            borderColor: activeTab === 'free_tests' ? Colors.primary : Colors.border,
          },
        ]}
        onPress={() => setActiveTab('free_tests')}
      >
        <BookOpen 
          size={18} 
          color={activeTab === 'free_tests' ? '#fff' : Colors.text} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'free_tests' ? '#fff' : Colors.text },
        ]}>
          {t.freeTests.freeQuizzes}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: activeTab === 'pyqs' ? Colors.primary : Colors.cardBackground,
            borderColor: activeTab === 'pyqs' ? Colors.primary : Colors.border,
          },
        ]}
        onPress={() => setActiveTab('pyqs')}
      >
        <FileText 
          size={18} 
          color={activeTab === 'pyqs' ? '#fff' : Colors.text} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'pyqs' ? '#fff' : Colors.text },
        ]}>
          {t.freeTests.pyqs}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <View style={[styles.searchInputContainer, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}>
        <Search size={20} color={Colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: Colors.text }]}
          placeholder={activeTab === 'free_tests' ? t.freeTests.searchFreeTests : t.freeTests.searchPYQs}
          placeholderTextColor={Colors.textSecondary}
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Filter size={20} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={[styles.filtersContainer, { backgroundColor: Colors.cardBackground }]}>
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: Colors.text }]}>
            {t.freeTests.difficulty}:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
            {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: filters.difficulty === difficulty ? Colors.primary : Colors.background,
                    borderColor: filters.difficulty === difficulty ? Colors.primary : Colors.border,
                  },
                ]}
                onPress={() => handleFilterChange('difficulty', difficulty)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: filters.difficulty === difficulty ? '#fff' : Colors.text },
                ]}>
                  {difficulty === 'all' ? t.common.all : t.freeTests[difficulty]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {activeTab === 'pyqs' && (
          <>
            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: Colors.text }]}>
                {t.freeTests.year}:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {['all', '2024', '2023', '2022', '2021', '2020'].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: filters.year === year ? Colors.primary : Colors.background,
                        borderColor: filters.year === year ? Colors.primary : Colors.border,
                      },
                    ]}
                    onPress={() => handleFilterChange('year', year)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      { color: filters.year === year ? '#fff' : Colors.text },
                    ]}>
                      {year === 'all' ? t.common.all : year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: Colors.text }]}>
                {t.freeTests.examType}:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {['all', 'GPSC', 'UPSC', 'SSC', 'Banking', 'Railways'].map((examType) => (
                  <TouchableOpacity
                    key={examType}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: filters.exam_type === examType ? Colors.primary : Colors.background,
                        borderColor: filters.exam_type === examType ? Colors.primary : Colors.border,
                      },
                    ]}
                    onPress={() => handleFilterChange('exam_type', examType)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      { color: filters.exam_type === examType ? '#fff' : Colors.text },
                    ]}>
                      {examType === 'all' ? t.common.all : examType}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderFreeTestItem = ({ item }: { item: any }) => {
    const title = currentLanguage === 'gu' && item.title_gujarati 
      ? item.title_gujarati 
      : item.title;
    const description = currentLanguage === 'gu' && item.description_gujarati 
      ? item.description_gujarati 
      : item.description;

    const DifficultyIcon = getDifficultyIcon(item.difficulty_level);

    return (
      <TouchableOpacity
        style={[styles.testCard, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}
        onPress={() => handleTestPress(item.uuid)}
        activeOpacity={0.7}
      >
        <View style={styles.testHeader}>
          <View style={styles.testTitleContainer}>
            <Text style={[styles.testTitle, { color: Colors.text }]} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.testBadges}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty_level) + '20' }]}>
                <DifficultyIcon size={12} color={getDifficultyColor(item.difficulty_level)} />
                <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty_level) }]}>
                  {t.freeTests[item.difficulty_level]}
                </Text>
              </View>
              <View style={[styles.freeBadge, { backgroundColor: Colors.success + '20' }]}>
                <Text style={[styles.freeText, { color: Colors.success }]}>
                  {t.freeTests.free}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {description && (
          <Text style={[styles.testDescription, { color: Colors.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
        )}

        <View style={styles.testStats}>
          <View style={styles.statItem}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={[styles.statText, { color: Colors.textSecondary }]}>
              {item.duration_minutes} {t.freeTests.min}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Award size={16} color={Colors.textSecondary} />
            <Text style={[styles.statText, { color: Colors.textSecondary }]}>
              {item.total_marks} {t.freeTests.marks}
            </Text>
          </View>
          <View style={styles.statItem}>
            <FileText size={16} color={Colors.textSecondary} />
            <Text style={[styles.statText, { color: Colors.textSecondary }]}>
              {item.questions_count} {t.freeTests.questions}
            </Text>
          </View>
          {item.user_attempts > 0 && (
            <View style={styles.statItem}>
              <Users size={16} color={Colors.primary} />
              <Text style={[styles.statText, { color: Colors.primary }]}>
                {item.user_attempts} {t.freeTests.attempts}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: Colors.primary }]}
          onPress={() => handleTestPress(item.uuid)}
        >
          <Play size={16} color="#fff" />
          <Text style={styles.startButtonText}>
            {item.user_attempts > 0 ? t.freeTests.retake : t.freeTests.start}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderPYQItem = ({ item }: { item: PYQ }) => {
    const title = currentLanguage === 'gu' && item.title_gujarati 
      ? item.title_gujarati 
      : item.title;
    const description = currentLanguage === 'gu' && item.description_gujarati 
      ? item.description_gujarati 
      : item.description;

    const DifficultyIcon = getDifficultyIcon(item.difficulty_level);

    return (
      <TouchableOpacity
        style={[styles.testCard, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}
        onPress={() => handleTestPress(item.uuid, true)}
        activeOpacity={0.7}
      >
        <View style={styles.testHeader}>
          <View style={styles.testTitleContainer}>
            <Text style={[styles.testTitle, { color: Colors.text }]} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.testBadges}>
              <View style={[styles.yearBadge, { backgroundColor: Colors.primary + '20' }]}>
                <Calendar size={12} color={Colors.primary} />
                <Text style={[styles.yearText, { color: Colors.primary }]}>
                  {item.year}
                </Text>
              </View>
              <View style={[styles.examTypeBadge, { backgroundColor: Colors.warning + '20' }]}>
                <Text style={[styles.examTypeText, { color: Colors.warning }]}>
                  {item.exam_type}
                </Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty_level) + '20' }]}>
                <DifficultyIcon size={12} color={getDifficultyColor(item.difficulty_level)} />
                <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty_level) }]}>
                  {t.freeTests[item.difficulty_level]}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {description && (
          <Text style={[styles.testDescription, { color: Colors.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
        )}

        <View style={styles.testStats}>
          <View style={styles.statItem}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={[styles.statText, { color: Colors.textSecondary }]}>
              {item.duration_minutes} {t.freeTests.min}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Award size={16} color={Colors.textSecondary} />
            <Text style={[styles.statText, { color: Colors.textSecondary }]}>
              {item.total_marks} {t.freeTests.marks}
            </Text>
          </View>
          <View style={styles.statItem}>
            <FileText size={16} color={Colors.textSecondary} />
            <Text style={[styles.statText, { color: Colors.textSecondary }]}>
              {item.questions_count} {t.freeTests.questions}
            </Text>
          </View>
          {item.attempts_count > 0 && (
            <View style={styles.statItem}>
              <Users size={16} color={Colors.textSecondary} />
              <Text style={[styles.statText, { color: Colors.textSecondary }]}>
                {item.attempts_count} {t.freeTests.attempts}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: Colors.primary }]}
          onPress={() => handleTestPress(item.uuid, true)}
        >
          <Play size={16} color="#fff" />
          <Text style={styles.startButtonText}>
            {(item.user_attempts && item.user_attempts > 0) ? t.freeTests.retake : t.freeTests.start}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    const isLoading = activeTab === 'free_tests' ? freeTestsLoading : pyqsLoading;
    const isFetching = activeTab === 'free_tests' ? freeTestsFetching : pyqsFetching;
    const data = activeTab === 'free_tests' ? freeTestsData?.data || [] : pyqsData?.data || [];

    if (isLoading) {
      return <SkeletonLoader />;
    }

    return (
      <FlatList
        data={data}
        renderItem={activeTab === 'free_tests' ? renderFreeTestItem : renderPYQItem}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {activeTab === 'free_tests' ? (
              <BookOpen size={48} color={Colors.textSecondary} />
            ) : (
              <FileText size={48} color={Colors.textSecondary} />
            )}
            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
              {activeTab === 'free_tests' ? t.freeTests.noFreeTests : t.freeTests.noPYQs}
            </Text>
            <Text style={[styles.emptySubtext, { color: Colors.textSecondary }]}>
              {activeTab === 'free_tests' ? t.freeTests.noFreeTestsMessage : t.freeTests.noPYQsMessage}
            </Text>
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { borderBottomColor: Colors.border }]}>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>
          {t.freeTests.title}
        </Text>
        <Text style={[styles.headerSubtitle, { color: Colors.textSecondary }]}>
          {t.freeTests.subtitle}
        </Text>
      </View>

      {renderTabHeader()}
      {renderSearchAndFilters()}
      {renderFilters()}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  filterRow: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterOptions: {
    flexGrow: 0,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  testCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  testHeader: {
    marginBottom: 12,
  },
  testTitleContainer: {
    gap: 8,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  testBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  examTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  examTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  testStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});