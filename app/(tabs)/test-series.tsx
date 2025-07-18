import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Star, Clock, Users, Play, Lock, CircleCheck as CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/theme';

export default function TestSeriesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Exam Wise', 'Subject Wise', 'NCERT', 'Free'];

  const testSeries = [
    {
      id: 1,
      title: 'PSI Mock Test Series',
      category: 'Exam Wise',
      price: 299,
      originalPrice: 499,
      tests: 10,
      freeTests: 2,
      students: 1250,
      rating: 4.8,
      duration: '3 months',
      description: 'Complete preparation for Police Sub Inspector exam with detailed solutions',
      topics: ['General Knowledge', 'Reasoning', 'Mathematics', 'English'],
      isPurchased: false,
    },
    {
      id: 2,
      title: 'Deputy Section Officer Series',
      category: 'Exam Wise',
      price: 399,
      originalPrice: 599,
      tests: 15,
      freeTests: 3,
      students: 890,
      rating: 4.7,
      duration: '4 months',
      description: 'Comprehensive test series for Deputy Section Officer examination',
      topics: ['General Studies', 'Current Affairs', 'Reasoning', 'English'],
      isPurchased: true,
    },
    {
      id: 3,
      title: 'Mathematics Test Series',
      category: 'Subject Wise',
      price: 199,
      originalPrice: 299,
      tests: 25,
      freeTests: 5,
      students: 2100,
      rating: 4.9,
      duration: '2 months',
      description: 'Advanced mathematics practice tests for competitive exams',
      topics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
      isPurchased: false,
    },
    {
      id: 4,
      title: 'NCERT Class 10 Series',
      category: 'NCERT',
      price: 149,
      originalPrice: 249,
      tests: 30,
      freeTests: 6,
      students: 3200,
      rating: 4.6,
      duration: '6 months',
      description: 'Complete NCERT Class 10 test series with chapter-wise tests',
      topics: ['Science', 'Mathematics', 'Social Science', 'English'],
      isPurchased: false,
    },
  ];

  const filteredSeries = testSeries.filter(series => {
    const matchesSearch = series.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || series.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = (seriesId: number) => {
    router.push(`/payment?seriesId=${seriesId}`);
  };

  const handleStartTest = (seriesId: number) => {
    router.push('/test/quiz');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Test Series</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search test series..."
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
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Test Series List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredSeries.map((series) => (
          <View key={series.id} style={styles.seriesCard}>
            {/* Header */}
            <View style={styles.seriesHeader}>
              <View style={styles.seriesHeaderLeft}>
                <Text style={styles.seriesTitle}>{series.title}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.rating}>{series.rating}</Text>
                  <Text style={styles.studentsCount}>({series.students} students)</Text>
                </View>
              </View>
              {series.isPurchased && (
                <View style={styles.purchasedBadge}>
                  <CheckCircle size={16} color="#10B981" />
                  <Text style={styles.purchasedText}>Purchased</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text style={styles.seriesDescription}>{series.description}</Text>

            {/* Topics */}
            <View style={styles.topicsContainer}>
              {series.topics.slice(0, 3).map((topic, index) => (
                <View key={index} style={styles.topicChip}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
              {series.topics.length > 3 && (
                <Text style={styles.moreTopics}>+{series.topics.length - 3} more</Text>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.statText}>{series.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <Play size={16} color="#6B7280" />
                <Text style={styles.statText}>{series.tests} Tests</Text>
              </View>
              <View style={styles.statItem}>
                <Users size={16} color="#6B7280" />
                <Text style={styles.statText}>{series.freeTests} Free</Text>
              </View>
            </View>

            {/* Price and Action */}
            <View style={styles.actionContainer}>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{series.price}</Text>
                <Text style={styles.originalPrice}>₹{series.originalPrice}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round((1 - series.price / series.originalPrice) * 100)}% OFF
                  </Text>
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.freeTestButton}
                  onPress={() => handleStartTest(series.id)}
                >
                  <Text style={styles.freeTestText}>Try Free</Text>
                </TouchableOpacity>
                
                {series.isPurchased ? (
                  <TouchableOpacity 
                    style={styles.startButton}
                    onPress={() => handleStartTest(series.id)}
                  >
                    <Text style={styles.startButtonText}>Start Tests</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.purchaseButton}
                    onPress={() => handlePurchase(series.id)}
                  >
                    <Lock size={16} color="#FFFFFF" />
                    <Text style={styles.purchaseButtonText}>Purchase</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    gap: 8,
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
    gap: 8,
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
});
