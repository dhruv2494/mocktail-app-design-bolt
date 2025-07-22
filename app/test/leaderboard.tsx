import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Medal, Award, TrendingUp, Calendar, ChevronLeft, Crown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function TestLeaderboardScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Test');
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);

  const periods = ['This Test', 'Weekly', 'Monthly', 'All Time'];

  const testInfo = {
    title: 'PSI Mock Test 1',
    totalParticipants: 1250,
    averageScore: 68.5,
    completionRate: 89.2
  };

  const topPerformers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      score: 95,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      timeTaken: 5400, // 90 minutes
      accuracy: 95.0,
      rank: 1,
    },
    {
      id: 2,
      name: 'Priya Sharma',
      score: 92,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      timeTaken: 5100, // 85 minutes
      accuracy: 92.0,
      rank: 2,
    },
    {
      id: 3,
      name: 'Amit Patel',
      score: 89,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      timeTaken: 4800, // 80 minutes
      accuracy: 89.0,
      rank: 3,
    },
  ];

  const leaderboardData = [
    {
      id: 4,
      name: 'Sneha Reddy',
      score: 86,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      timeTaken: 5700,
      accuracy: 86.0,
      rank: 4,
    },
    {
      id: 5,
      name: 'Vikram Singh',
      score: 84,
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      timeTaken: 5200,
      accuracy: 84.0,
      rank: 5,
    },
    {
      id: 6,
      name: 'Anita Gupta',
      score: 82,
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      timeTaken: 5900,
      accuracy: 82.0,
      rank: 6,
    },
    {
      id: 7,
      name: 'Rohit Mehta',
      score: 80,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      timeTaken: 6100,
      accuracy: 80.0,
      rank: 7,
    },
    {
      id: 8,
      name: 'Kavya Nair',
      score: 78,
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      timeTaken: 5800,
      accuracy: 78.0,
      rank: 8,
    },
  ];

  const currentUserRank = {
    name: 'You',
    score: 72,
    rank: 15,
    timeTaken: 6300,
    accuracy: 72.0,
    percentile: 85.2,
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color={Colors.premiumText} />;
      case 2:
        return <Medal size={24} color={Colors.premiumBadge} />;
      case 3:
        return <Award size={24} color={Colors.premiumText} />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const styles = getStyles(Colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.textSubtle} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={styles.headerSubtitle}>{testInfo.title}</Text>
        </View>
        <TouchableOpacity style={styles.calendarButton}>
          <Calendar size={20} color={Colors.textSubtle} />
        </TouchableOpacity>
      </View>

      {/* Test Stats */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.statsCard}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{testInfo.totalParticipants}</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{testInfo.averageScore}%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{testInfo.completionRate}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
          </View>
        </LinearGradient>
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

        {/* Top 3 Performers */}
        <View style={styles.topPerformersContainer}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <View style={styles.podiumContainer}>
            {/* 2nd Place */}
            <View style={styles.podiumItem}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={[styles.podiumRank, styles.secondPlace]}
              >
                <Image source={{ uri: topPerformers[1].avatar }} style={styles.podiumAvatar} />
                <Medal size={20} color={Colors.premiumBadge} />
              </LinearGradient>
              <Text style={styles.podiumName}>{topPerformers[1].name}</Text>
              <Text style={styles.podiumScore}>{topPerformers[1].score}%</Text>
              <Text style={styles.podiumTime}>{formatTime(topPerformers[1].timeTaken)}</Text>
            </View>

            {/* 1st Place */}
            <View style={[styles.podiumItem, styles.firstPlaceItem]}>
              <LinearGradient
                colors={[Colors.primary, Colors.chip]}
                style={[styles.podiumRank, styles.firstPlace]}
              >
                <Image source={{ uri: topPerformers[0].avatar }} style={styles.podiumAvatar} />
                <Crown size={24} color={Colors.premiumText} />
              </LinearGradient>
              <Text style={styles.podiumName}>{topPerformers[0].name}</Text>
              <Text style={styles.podiumScore}>{topPerformers[0].score}%</Text>
              <Text style={styles.podiumTime}>{formatTime(topPerformers[0].timeTaken)}</Text>
            </View>

            {/* 3rd Place */}
            <View style={styles.podiumItem}>
              <LinearGradient
                colors={[Colors.primary, Colors.textLink]}
                style={[styles.podiumRank, styles.thirdPlace]}
              >
                <Image source={{ uri: topPerformers[2].avatar }} style={styles.podiumAvatar} />
                <Award size={20} color={Colors.primaryLight} />
              </LinearGradient>
              <Text style={styles.podiumName}>{topPerformers[2].name}</Text>
              <Text style={styles.podiumScore}>{topPerformers[2].score}%</Text>
              <Text style={styles.podiumTime}>{formatTime(topPerformers[2].timeTaken)}</Text>
            </View>
          </View>
        </View>

        {/* Your Rank */}
        <View style={styles.yourRankContainer}>
          <Text style={styles.sectionTitle}>Your Performance</Text>
          <LinearGradient
            colors={[Colors.primaryExtraLight, Colors.white]}
            style={styles.yourRankCard}
          >
            <View style={styles.rankInfo}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankNumber}>{currentUserRank.rank}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{currentUserRank.name}</Text>
                <Text style={styles.userStats}>
                  {currentUserRank.accuracy}% accuracy • {formatTime(currentUserRank.timeTaken)}
                </Text>
              </View>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.userScore}>{currentUserRank.score}%</Text>

            </View>
          </LinearGradient>
        </View>

        {/* Full Leaderboard */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.sectionTitle}>All Rankings</Text>
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
                    {user.accuracy}% accuracy • {formatTime(user.timeTaken)}
                  </Text>
                </View>
              </View>
              <View style={styles.scoreInfo}>
                <Text style={styles.userScore}>{user.score}%</Text>
              </View>
            </View>
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
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginTop: 2,
  },
  calendarButton: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  periodContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.chip,
    marginRight: 12,
  },
  periodChipActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSubtle,
  },
  periodTextActive: {
    color: Colors.white,
  },
  topPerformersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 220,
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
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumScore: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textLink,
    marginBottom: 2,
  },
  podiumTime: {
    fontSize: 12,
    color: Colors.textSubtle,
  },
  yourRankContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  yourRankCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  leaderboardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  leaderboardItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.shadow,
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
    backgroundColor: Colors.chip,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSubtle,
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
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userStats: {
    fontSize: 12,
    color: Colors.textSubtle,
  },
  scoreInfo: {
    alignItems: 'flex-end',
  },
  userScore: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLink,
    marginBottom: 2,
  },
  percentileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentileText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSubtle,
    marginLeft: 2,
  },
});