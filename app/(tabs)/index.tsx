import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Search, Play, Clock, Users, Award, BookOpen, FileText } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const quickActions = [
    { id: 1, title: 'Free Tests', icon: Play, color: '#10B981', route: '/test/quiz' },
    { id: 2, title: 'PYQs', icon: Clock, color: '#FF6B35', route: '/test/quiz' },
    { id: 3, title: 'Test Series', icon: BookOpen, color: '#F7931E', route: '/test-series' },
    { id: 4, title: 'Study PDFs', icon: FileText, color: '#FF6B35', route: '/pdfs' },
  ];

  const recentTests = [
    { id: 1, title: 'NCERT Class 10 - Math', score: 85, total: 100, date: '2 days ago' },
    { id: 2, title: 'PSI Mock Test 1', score: 72, total: 100, date: '5 days ago' },
    { id: 3, title: 'Deputy Section Officer', score: 91, total: 100, date: '1 week ago' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.greeting}>Good Morning!</Text>
              <Text style={styles.userName}>John Doe</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Search size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.statCard}
          >
            <Award size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>1,247</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={['#F7931E', '#FF6B35']}
            style={styles.statCard}
          >
            <Users size={32} color="#FFFFFF" />
            <Text style={styles.statNumber}>15th</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => {
                  if (action.route === '/test/quiz') {
                    router.push('/test/quiz');
                  } else {
                    router.push(action.route);
                  }
                }}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <action.icon size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Tests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tests</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTests.map((test) => (
            <TouchableOpacity key={test.id} style={styles.testCard}>
              <View style={styles.testCardLeft}>
                <Text style={styles.testTitle}>{test.title}</Text>
                <Text style={styles.testDate}>{test.date}</Text>
              </View>
              <View style={styles.testCardRight}>
                <Text style={styles.testScore}>{test.score}/{test.total}</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${(test.score / test.total) * 100}%` }]} 
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Test Series */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Test Series</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.featuredCard}>
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.featuredGradient}
              >
                <Text style={styles.featuredTitle}>PSI Mock Tests</Text>
                <Text style={styles.featuredSubtitle}>10 Tests • ₹299</Text>
                <Text style={styles.featuredDescription}>Complete preparation for PSI exam</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featuredCard}>
              <LinearGradient
                colors={['#F7931E', '#FF6B35']}
                style={styles.featuredGradient}
              >
                <Text style={styles.featuredTitle}>NCERT Series</Text>
                <Text style={styles.featuredSubtitle}>50+ Tests • ₹199</Text>
                <Text style={styles.featuredDescription}>Class 6-12 comprehensive tests</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  testCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  testCardLeft: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  testDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  testCardRight: {
    alignItems: 'flex-end',
  },
  testScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  featuredCard: {
    width: 280,
    marginRight: 16,
  },
  featuredGradient: {
    padding: 20,
    borderRadius: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});