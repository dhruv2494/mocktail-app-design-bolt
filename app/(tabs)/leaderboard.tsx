import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  Calendar,
  Users,
  Star,
  ChevronDown
} from 'lucide-react-native';
import { useGetLeaderboardQuery } from '@/store/api/testApi';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTheme } from '@/theme';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

interface LeaderboardUser {
  id: number;
  uuid: string;
  name: string;
  email: string;
  avatar?: string;
  score: number;
  percentage: number;
  total_tests: number;
  rank: number;
  is_current_user: boolean;
  badges?: string[];
  time_taken_minutes?: number;
}

interface LeaderboardFilters {
  period: 'today' | 'week' | 'month' | 'all_time';
  category?: string;
  test_series?: string;
}

export default function LeaderboardScreen() {
  const { isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const Colors = getTheme(isDarkMode);

  const [filters, setFilters] = useState<LeaderboardFilters>({
    period: 'week',
  });
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: leaderboardData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetLeaderboardQuery(filters);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Trophy size={24} color="#FFD700" />;
    } else if (rank === 2) {
      return <Medal size={24} color="#C0C0C0" />;
    } else if (rank === 3) {
      return <Award size={24} color="#CD7F32" />;
    }
    return (
      <View style={[styles.rankBadge, { backgroundColor: Colors.border }]}>
        <Text style={[styles.rankText, { color: Colors.text }]}>{rank}</Text>
      </View>
    );
  };

  const renderUserAvatar = (user: LeaderboardUser) => {
    const initials = user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <View style={[
        styles.avatar, 
        { 
          backgroundColor: user.is_current_user ? Colors.primary : Colors.border,
        }
      ]}>
        <Text style={[
          styles.avatarText, 
          { 
            color: user.is_current_user ? '#fff' : Colors.text,
          }
        ]}>
          {initials}
        </Text>
      </View>
    );
  };

  const renderLeaderboardItem = ({ item: user, index }: { item: LeaderboardUser; index: number }) => (
    <View style={[
      styles.leaderboardItem,
      {
        backgroundColor: user.is_current_user 
          ? Colors.primary + '10' 
          : Colors.cardBackground,
        borderColor: user.is_current_user 
          ? Colors.primary 
          : Colors.border,
        borderWidth: user.is_current_user ? 2 : 1,
      },
    ]}>
      <View style={styles.rankContainer}>
        {renderRankIcon(user.rank)}
      </View>

      <View style={styles.userInfo}>
        {renderUserAvatar(user)}
        <View style={styles.userDetails}>
          <View style={styles.userHeader}>
            <Text style={[
              styles.userName,
              { 
                color: user.is_current_user ? Colors.primary : Colors.text,
                fontWeight: user.is_current_user ? '700' : '600',
              }
            ]}>
              {user.name}
              {user.is_current_user && (
                <Text style={[styles.youLabel, { color: Colors.primary }]}>
                  {' '}({t.leaderboard.you})
                </Text>
              )}
            </Text>
            {user.badges && user.badges.length > 0 && (
              <View style={styles.badges}>
                {user.badges.slice(0, 2).map((badge, idx) => (
                  <Star key={idx} size={12} color={Colors.warning} />
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.userStats}>
            <Text style={[styles.userStatsText, { color: Colors.textSecondary }]}>
              {t.leaderboard.tests}: {user.total_tests} • {t.leaderboard.score}: {user.score}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreValue, { color: Colors.success }]}>
          {user.percentage.toFixed(1)}%
        </Text>
        <Text style={[styles.scoreLabel, { color: Colors.textSecondary }]}>
          {t.leaderboard.accuracy}
        </Text>
        {user.time_taken_minutes && (
          <Text style={[styles.timeText, { color: Colors.textSecondary }]}>
            {user.time_taken_minutes}m avg
          </Text>
        )}
      </View>
    </View>
  );

  const renderPeriodFilter = () => {
    const periods = [
      { key: 'today', label: t.leaderboard.today, icon: Calendar },
      { key: 'week', label: t.leaderboard.thisWeek, icon: Calendar },
      { key: 'month', label: t.leaderboard.thisMonth, icon: Calendar },
      { key: 'all_time', label: t.leaderboard.allTime, icon: TrendingUp },
    ] as const;

    return (
      <View style={styles.filterSection}>
        <Text style={[styles.filterTitle, { color: Colors.text }]}>
          {t.leaderboard.timePeriod}
        </Text>
        <View style={styles.periodFilters}>
          {periods.map((period) => {
            const Icon = period.icon;
            const isSelected = filters.period === period.key;
            
            return (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor: isSelected 
                      ? Colors.primary 
                      : Colors.cardBackground,
                    borderColor: isSelected 
                      ? Colors.primary 
                      : Colors.border,
                  },
                ]}
                onPress={() => setFilters(prev => ({ ...prev, period: period.key }))}
              >
                <Icon 
                  size={16} 
                  color={isSelected ? '#fff' : Colors.text} 
                />
                <Text style={[
                  styles.periodButtonText,
                  { color: isSelected ? '#fff' : Colors.text },
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderTopPerformers = () => {
    if (!leaderboardData?.data || leaderboardData.data.length === 0) return null;

    const topThree = leaderboardData.data.slice(0, 3);
    if (topThree.length === 0) return null;

    // Reorder for podium display (2nd, 1st, 3rd)
    const podiumOrder = [
      topThree[1], // 2nd place
      topThree[0], // 1st place  
      topThree[2], // 3rd place
    ].filter(Boolean);

    return (
      <View style={styles.podiumContainer}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>
          {t.leaderboard.topPerformers}
        </Text>
        
        <View style={styles.podium}>
          {podiumOrder.map((user, index) => {
            if (!user) return null;
            
            const actualRank = user.rank;
            const isWinner = actualRank === 1;
            const podiumHeight = isWinner ? 120 : actualRank === 2 ? 100 : 80;
            
            return (
              <View key={user.uuid} style={[styles.podiumPlace, { height: podiumHeight }]}>
                <View style={styles.podiumUser}>
                  {renderUserAvatar(user)}
                  <View style={styles.podiumRank}>
                    {renderRankIcon(actualRank)}
                  </View>
                </View>
                
                <View style={[
                  styles.podiumBase,
                  {
                    backgroundColor: actualRank === 1 
                      ? '#FFD700' 
                      : actualRank === 2 
                      ? '#C0C0C0' 
                      : '#CD7F32',
                    height: podiumHeight - 60,
                  },
                ]}>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {user.name.split(' ')[0]}
                  </Text>
                  <Text style={styles.podiumScore}>
                    {user.percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderStats = () => {
    if (!leaderboardData?.stats) return null;

    const { stats } = leaderboardData;
    
    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: Colors.cardBackground }]}>
          <Users size={20} color={Colors.primary} />
          <Text style={[styles.statValue, { color: Colors.text }]}>
            {stats.total_participants || 0}
          </Text>
          <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
            {t.leaderboard.participants}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: Colors.cardBackground }]}>
          <TrendingUp size={20} color={Colors.success} />
          <Text style={[styles.statValue, { color: Colors.text }]}>
            {stats.average_score?.toFixed(1) || '0.0'}%
          </Text>
          <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
            {t.leaderboard.avgScore}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: Colors.cardBackground }]}>
          <Trophy size={20} color={Colors.warning} />
          <Text style={[styles.statValue, { color: Colors.text }]}>
            {stats.total_tests || 0}
          </Text>
          <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
            {t.leaderboard.totalTests}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <SkeletonLoader />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.errorContainer}>
          <Trophy size={48} color={Colors.textSecondary} />
          <Text style={[styles.errorText, { color: Colors.error }]}>
            {t.leaderboard.loadError}
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

  const leaderboardUsers = leaderboardData?.data || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors.border }]}>
        <View style={styles.headerContent}>
          <Trophy size={24} color={Colors.primary} />
          <Text style={[styles.headerTitle, { color: Colors.text }]}>
            {t.leaderboard.title}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.filterToggle, { backgroundColor: Colors.cardBackground }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <ChevronDown 
            size={20} 
            color={Colors.text}
            style={{ 
              transform: [{ rotate: showFilters ? '180deg' : '0deg' }] 
            }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Filters */}
        {showFilters && renderPeriodFilter()}

        {/* Stats */}
        {renderStats()}

        {/* Top Performers Podium */}
        {renderTopPerformers()}

        {/* Full Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>
            {t.leaderboard.fullRankings}
          </Text>
          
          {leaderboardUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Trophy size={48} color={Colors.textSecondary} />
              <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
                {t.leaderboard.noData}
              </Text>
              <Text style={[styles.emptySubtext, { color: Colors.textSecondary }]}>
                {t.leaderboard.noDataMessage}
              </Text>
            </View>
          ) : (
            <FlatList
              data={leaderboardUsers}
              renderItem={renderLeaderboardItem}
              keyExtractor={(item) => item.uuid}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.leaderboardList}
            />
          )}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  filterToggle: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  periodFilters: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  podiumContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 20,
  },
  podiumPlace: {
    alignItems: 'center',
    flex: 1,
  },
  podiumUser: {
    position: 'relative',
    marginBottom: 8,
  },
  podiumRank: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  podiumBase: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  podiumScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  leaderboardSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  youLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    gap: 2,
  },
  userStats: {
    flexDirection: 'row',
  },
  userStatsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
    marginTop: 16,
    marginBottom: 24,
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