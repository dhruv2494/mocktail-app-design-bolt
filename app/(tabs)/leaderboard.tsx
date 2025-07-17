import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Medal, Award, TrendingUp, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LeaderboardScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  const [selectedCategory, setSelectedCategory] = useState('Overall');

  const periods = ['Daily', 'Weekly', 'Monthly', 'All Time'];
  const categories = ['Overall', 'PSI Mock', 'NCERT', 'Mathematics', 'General Knowledge'];

  const topPerformers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      score: 2847,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      testsCompleted: 45,
      accuracy: 94.2,
      rank: 1,
    },
    {
      id: 2,
      name: 'Priya Sharma',
      score: 2756,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      testsCompleted: 42,
      accuracy: 91.8,
      rank: 2,
    },
    {
      id: 3,
      name: 'Amit Patel',
      score: 2689,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      testsCompleted: 38,
      accuracy: 89.5,
      rank: 3,
    },
  ];

  const leaderboardData = [
    {
      id: 4,
      name: 'Sneha Reddy',
      score: 2634,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      testsCompleted: 41,
      accuracy: 88.7,
      rank: 4,
      change: '+2',
    },
    {
      id: 5,
      name: 'Vikram Singh',
      score: 2598,
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      testsCompleted: 39,
      accuracy: 87.3,
      rank: 5,
      change: '-1',
    },
    {
      id: 6,
      name: 'Anita Gupta',
      score: 2567,
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      testsCompleted: 36,
      accuracy: 86.9,
      rank: 6,
      change: '+1',
    },
    {
      id: 7,
      name: 'Rohit Mehta',
      score: 2534,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      testsCompleted: 34,
      accuracy: 85.4,
      rank: 7,
      change: '0',
    },
    {
      id: 8,
      name: 'Kavya Nair',
      score: 2501,
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      testsCompleted: 33,
      accuracy: 84.8,
      rank: 8,
      change: '+3',
    },
  ];

  const currentUserRank = {
    name: 'You',
    score: 1847,
    rank: 15,
    testsCompleted: 28,
    accuracy: 82.1,
    change: '+5',
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Award size={24} color="#CD7F32" />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return '#10B981';
    if (change.startsWith('-')) return '#EF4444';
    return '#6B7280';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity style={styles.calendarButton}>
          <Calendar size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.periodContainer}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodChip,
                selectedPeriod === period && styles.periodChipActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
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

        {/* Top 3 Performers */}
        <View style={styles.topPerformersContainer}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <View style={styles.podiumContainer}>
            {/* 2nd Place */}
            <View style={styles.podiumItem}>
              <LinearGradient
                colors={['#E5E7EB', '#9CA3AF']}
                style={[styles.podiumRank, styles.secondPlace]}
              >
                <Image source={{ uri: topPerformers[1].avatar }} style={styles.podiumAvatar} />
                <Medal size={20} color="#C0C0C0" />
              </LinearGradient>
              <Text style={styles.podiumName}>{topPerformers[1].name}</Text>
              <Text style={styles.podiumScore}>{topPerformers[1].score}</Text>
            </View>

            {/* 1st Place */}
            <View style={[styles.podiumItem, styles.firstPlaceItem]}>
              <LinearGradient
                colors={['#FEF3C7', '#F59E0B']}
                style={[styles.podiumRank, styles.firstPlace]}
              >
                <Image source={{ uri: topPerformers[0].avatar }} style={styles.podiumAvatar} />
                <Trophy size={24} color="#FFD700" />
              </LinearGradient>
              <Text style={styles.podiumName}>{topPerformers[0].name}</Text>
              <Text style={styles.podiumScore}>{topPerformers[0].score}</Text>
            </View>

            {/* 3rd Place */}
            <View style={styles.podiumItem}>
              <LinearGradient
                colors={['#FED7AA', '#F97316']}
                style={[styles.podiumRank, styles.thirdPlace]}
              >
                <Image source={{ uri: topPerformers[2].avatar }} style={styles.podiumAvatar} />
                <Award size={20} color="#CD7F32" />
              </LinearGradient>
              <Text style={styles.podiumName}>{topPerformers[2].name}</Text>
              <Text style={styles.podiumScore}>{topPerformers[2].score}</Text>
            </View>
          </View>
        </View>

        {/* Your Rank */}
        <View style={styles.yourRankContainer}>
          <Text style={styles.sectionTitle}>Your Rank</Text>
          <View style={styles.yourRankCard}>
            <View style={styles.rankInfo}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankNumber}>{currentUserRank.rank}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{currentUserRank.name}</Text>
                <Text style={styles.userStats}>
                  {currentUserRank.testsCompleted} tests • {currentUserRank.accuracy}% accuracy
                </Text>
              </View>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.userScore}>{currentUserRank.score}</Text>
              <View style={styles.changeContainer}>
                <TrendingUp size={12} color={getChangeColor(currentUserRank.change)} />
                <Text style={[styles.changeText, { color: getChangeColor(currentUserRank.change) }]}>
                  {currentUserRank.change}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Full Leaderboard */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.sectionTitle}>Rankings</Text>
          {leaderboardData.map((user) => (
            <View key={user.id} style={styles.leaderboardItem}>
              <View style={styles.rankInfo}>
                <View style={styles.rankBadge}>
                  {getRankIcon(user.rank)}
                </View>
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userStats}>
                    {user.testsCompleted} tests • {user.accuracy}% accuracy
                  </Text>
                </View>
              </View>
              <View style={styles.scoreInfo}>
                <Text style={styles.userScore}>{user.score}</Text>
                <View style={styles.changeContainer}>
                  <TrendingUp size={12} color={getChangeColor(user.change)} />
                  <Text style={[styles.changeText, { color: getChangeColor(user.change) }]}>
                    {user.change}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  calendarButton: {
    padding: 8,
  },
  periodContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  periodChipActive: {
    backgroundColor: '#3B82F6',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#3B82F6',
  },
  topPerformersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 200,
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  firstPlaceItem: {
    marginBottom: 20,
  },
  podiumRank: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  firstPlace: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  secondPlace: {
    marginTop: 20,
  },
  thirdPlace: {
    marginTop: 40,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    top: 8,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  yourRankContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  yourRankCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  leaderboardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  leaderboardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  userStats: {
    fontSize: 12,
    color: '#6B7280',
  },
  scoreInfo: {
    alignItems: 'flex-end',
  },
  userScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
});