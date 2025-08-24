import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Folder, FileText, Play } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useGetDynamicCategoryByUuidQuery } from '@/store/api/dynamicHierarchyApi';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function CategoryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryUuid: string;
    categoryName: string;
    seriesUuid: string;
  }>();

  const [language, setLanguage] = useState<'english' | 'gujarati'>('english');

  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const styles = getStyles(Colors);

  const {
    data: categoryData,
    isLoading,
    error,
    refetch,
  } = useGetDynamicCategoryByUuidQuery(params.categoryUuid);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading category...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading category</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!categoryData?.data) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Category not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { category, content_type, content, breadcrumb, statistics } = categoryData.data;

  const handleSubcategoryPress = (subcategory: any) => {
    router.push({
      pathname: '/test/category-detail',
      params: {
        categoryUuid: subcategory.uuid,
        categoryName: subcategory.name,
        seriesUuid: params.seriesUuid,
      },
    });
  };

  const handleStartQuiz = () => {
    // Only allow quiz if this specific category has direct questions
    if (content_type === 'questions' && Array.isArray(content) && content.length > 0) {
      router.push({
        pathname: '/test/quiz',
        params: {
          categoryUuid: params.categoryUuid,
          categoryName: params.categoryName,
          seriesUuid: params.seriesUuid,
          language,
        },
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'No Questions at This Level',
        text2: 'Please navigate through subcategories to find questions.',
      });
    }
  };

  const renderBreadcrumb = () => (
    <View style={styles.breadcrumbContainer}>
      <View style={styles.breadcrumbHeader}>
        <Text style={styles.breadcrumbTitle}>
          Navigation Path (Level {breadcrumb.length - 1} of 6+)
        </Text>
        <Text style={styles.breadcrumbDepth}>
          📍 Current: Level {breadcrumb.length - 1}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.breadcrumbScroll}>
        {breadcrumb.map((item, index) => (
          <View key={item.uuid} style={styles.breadcrumbItem}>
            <View style={styles.breadcrumbLevel}>
              <Text style={styles.breadcrumbLevelText}>L{index}</Text>
            </View>
            <Text style={styles.breadcrumbText}>
              {item.name}
            </Text>
            {index < breadcrumb.length - 1 && (
              <Text style={styles.breadcrumbSeparator}> ▶ </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderContent = () => {
    if (content_type === 'categories' && Array.isArray(content)) {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Subcategories (Level {category.hierarchy_level + 1})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Navigate deeper to find questions - this hierarchy has {statistics?.total_questions_recursive || 0} questions at deeper levels
            </Text>
          </View>
          {content.map((subcategory: any) => (
            <TouchableOpacity
              key={subcategory.uuid}
              style={styles.categoryItem}
              onPress={() => handleSubcategoryPress(subcategory)}
            >
              <View style={styles.categoryIcon}>
                <Folder size={24} color={Colors.primary} />
              </View>
              <View style={styles.categoryContent}>
                <View style={styles.categoryTitleRow}>
                  <Text style={styles.categoryTitle}>
                    {language === 'gujarati' && subcategory.name_gujarati
                      ? subcategory.name_gujarati
                      : subcategory.name}
                  </Text>
                  <View style={styles.levelIndicator}>
                    <Text style={styles.levelText}>L{subcategory.hierarchy_level}</Text>
                  </View>
                </View>
                {subcategory.description && (
                  <Text style={styles.categoryDescription}>
                    {language === 'gujarati' && subcategory.description_gujarati
                      ? subcategory.description_gujarati
                      : subcategory.description}
                  </Text>
                )}
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryMetaText}>
                    {subcategory.has_subcategories && `${subcategory.subcategories_count} more levels deeper`}
                    {subcategory.questions_count > 0 && ` • ${subcategory.questions_count} questions here`}
                  </Text>
                  {subcategory.total_questions_recursive > 0 && (
                    <View style={styles.questionsRecursiveContainer}>
                      <Text style={styles.categoryRecursiveText}>
                        🎯 {subcategory.total_questions_recursive} total questions in this branch
                      </Text>
                      <Text style={styles.navigationHint}>
                        Tap to explore deeper levels →
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (content_type === 'questions' && Array.isArray(content)) {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.questionsHeader}>
            <Text style={styles.sectionTitle}>
              Questions ({content.length})
            </Text>
            <View style={styles.languageToggle}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'english' && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage('english')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === 'english' && styles.languageButtonTextActive,
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'gujarati' && styles.languageButtonActive,
                ]}
                onPress={() => setLanguage('gujarati')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    language === 'gujarati' && styles.languageButtonTextActive,
                  ]}
                >
                  ગુ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.startQuizButton} onPress={handleStartQuiz}>
            <Play size={20} color="white" />
            <Text style={styles.startQuizText}>Start Quiz</Text>
          </TouchableOpacity>

          {content.map((question: any, index: number) => (
            <View key={question.uuid} style={styles.questionPreview}>
              <Text style={styles.questionNumber}>Q{index + 1}.</Text>
              <Text style={styles.questionText}>
                {language === 'gujarati' && question.question_text_gujarati
                  ? question.question_text_gujarati
                  : question.question_text}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    // Show guidance for navigating deeper into the hierarchy
    return (
      <View style={styles.emptyContainer}>
        <Folder size={48} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>Continue Navigation</Text>
        <Text style={styles.emptySubtext}>
          You're currently at Level {category.hierarchy_level}. This level contains subcategories but no questions.
        </Text>
        <Text style={styles.emptySubtext}>
          Keep navigating through subcategories to reach the question levels.
        </Text>
        {statistics?.has_questions_somewhere && (
          <View style={styles.emptyHintContainer}>
            <Text style={styles.emptyHintText}>
              🎯 {statistics.total_questions_recursive} questions waiting at deeper levels
            </Text>
            <Text style={styles.emptyActionText}>
              ⬇️ Tap on subcategories below to continue exploring
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {language === 'gujarati' && category.name_gujarati
              ? category.name_gujarati
              : category.name}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Breadcrumb */}
        {renderBreadcrumb()}

        {/* Category Description */}
        {category.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              {language === 'gujarati' && category.description_gujarati
                ? category.description_gujarati
                : category.description}
            </Text>
          </View>
        )}

        {/* Content */}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  breadcrumbContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  breadcrumbHeader: {
    marginBottom: 12,
  },
  breadcrumbTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  breadcrumbDepth: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  breadcrumbScroll: {
    marginTop: 8,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  breadcrumbLevel: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    minWidth: 28,
    alignItems: 'center',
  },
  breadcrumbLevelText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  breadcrumbText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    fontSize: 16,
    color: Colors.primary,
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryIcon: {
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  levelIndicator: {
    backgroundColor: Colors.warning || Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  categoryMeta: {
    marginTop: 4,
  },
  categoryMetaText: {
    fontSize: 12,
    color: Colors.primary,
  },
  categoryRecursiveText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    marginBottom: 4,
  },
  questionsRecursiveContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navigationHint: {
    fontSize: 11,
    color: Colors.primary,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    padding: 2,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  languageButtonActive: {
    backgroundColor: Colors.primary,
  },
  languageButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  languageButtonTextActive: {
    color: 'white',
  },
  startQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  startQuizText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  questionPreview: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 8,
    minWidth: 24,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyHintContainer: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  emptyHintText: {
    fontSize: 14,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyActionText: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});