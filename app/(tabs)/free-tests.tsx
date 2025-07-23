import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Play, Clock, Users, Award, BookOpen, Filter, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FreeTestsScreen() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const Colors = getTheme(isDarkMode);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { key: 'All', label: t.freeTests.categories.all },
    { key: 'Mock Tests', label: t.freeTests.categories.mockTests },
    { key: 'PYQs', label: t.freeTests.categories.pyqs },
    { key: 'Topic Wise', label: t.freeTests.categories.topicWise },
    { key: 'Quick Tests', label: t.freeTests.categories.quickTests }
  ];

  const freeTests = [
    {
      id: 1,
      title: 'PSI Mock Test - Free Sample',
      description: 'Complete mock test for PSI preparation',
      questions: 100,
      duration: 120,
      attempts: 1245,
      difficulty: 'Medium',
      type: 'Mock Test',
      tags: ['Free', 'Popular']
    },
    {
      id: 2,
      title: 'Deputy Section Officer - 2023 PYQ',
      description: 'Previous year questions from 2023 exam',
      questions: 50,
      duration: 60,
      attempts: 892,
      difficulty: 'Medium',
      type: 'PYQ',
      tags: ['Free', 'PYQ']
    },
    {
      id: 3,
      title: 'NCERT Class 10 Math - Free Trial',
      description: 'Sample questions from NCERT curriculum',
      questions: 25,
      duration: 30,
      attempts: 2156,
      difficulty: 'Easy',
      type: 'Topic Wise',
      tags: ['Free', 'NCERT']
    },
    {
      id: 4,
      title: 'General Knowledge Quick Test',
      description: 'Quick GK test for competitive exams',
      questions: 15,
      duration: 15,
      attempts: 3421,
      difficulty: 'Easy',
      type: 'Quick Test',
      tags: ['Free', 'Quick']
    },
    {
      id: 5,
      title: 'Karnataka PSI - 2022 PYQ',
      description: 'Previous year questions from Karnataka PSI 2022',
      questions: 80,
      duration: 90,
      attempts: 567,
      difficulty: 'Hard',
      type: 'PYQ',
      tags: ['Free', 'PYQ', 'State Level']
    },
  ];

  const filteredTests = selectedCategory === 'All' 
    ? freeTests 
    : freeTests.filter(test => {
        const categoryKey = categories.find(c => c.key === selectedCategory)?.key;
        if (categoryKey === 'PYQs') return test.type === 'PYQ';
        if (categoryKey === 'Mock Tests') return test.type === 'Mock Test';
        if (categoryKey === 'Topic Wise') return test.type === 'Topic Wise';
        if (categoryKey === 'Quick Tests') return test.type === 'Quick Test';
        return false;
      });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return Colors.success;
      case 'Medium': return Colors.warning;
      case 'Hard': return Colors.danger;
      default: return Colors.textSubtle;
    }
  };

  const styles = getStyles(Colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t.freeTests.title}</Text>
            <Text style={styles.headerSubtitle}>{t.freeTests.subtitle}</Text>
          </View>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.activeCategoryButton
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.key && styles.activeCategoryText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Free Tests List */}
        <View style={styles.testsContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? t.freeTests.allFreeTests : categories.find(c => c.key === selectedCategory)?.label} ({filteredTests.length})
          </Text>
          
          {filteredTests.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={styles.testCard}
              onPress={() => router.push('/test/quiz')}
            >
              <View style={styles.testHeader}>
                <View style={styles.testTitleContainer}>
                  <Text style={styles.testTitle}>{test.title}</Text>
                  <Text style={styles.testDescription}>{test.description}</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {test.tags.map((tag, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.tag,
                        tag === 'Free' && { backgroundColor: Colors.success + '20' },
                        tag === 'Popular' && { backgroundColor: Colors.warning + '20' },
                        tag === 'PYQ' && { backgroundColor: Colors.primary + '20' },
                      ]}
                    >
                      <Text style={[
                        styles.tagText,
                        tag === 'Free' && { color: Colors.success },
                        tag === 'Popular' && { color: Colors.warning },
                        tag === 'PYQ' && { color: Colors.primary },
                      ]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.testStats}>
                <View style={styles.statItem}>
                  <BookOpen size={16} color={Colors.textSubtle} />
                  <Text style={styles.statText}>{test.questions} {t.freeTests.questions}</Text>
                </View>
                <View style={styles.statItem}>
                  <Clock size={16} color={Colors.textSubtle} />
                  <Text style={styles.statText}>{test.duration} {t.freeTests.minutes}</Text>
                </View>
                <View style={styles.statItem}>
                  <Users size={16} color={Colors.textSubtle} />
                  <Text style={styles.statText}>{test.attempts} {t.freeTests.attempts}</Text>
                </View>
                <View style={[styles.difficultyBadge, { borderColor: getDifficultyColor(test.difficulty) }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(test.difficulty) }]}>
                    {test.difficulty}
                  </Text>
                </View>
              </View>

              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                style={styles.startButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Play size={16} color={Colors.white} />
                <Text style={styles.startButtonText}>{t.freeTests.startTest}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSubtle,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light,
    borderWidth: 1,
    borderColor: Colors.muted,
  },
  activeCategoryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSubtle,
  },
  activeCategoryText: {
    color: Colors.white,
  },
  testsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  testCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  testHeader: {
    marginBottom: 16,
  },
  testTitleContainer: {
    marginBottom: 12,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.chip,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSubtle,
  },
  testStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.textSubtle,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});