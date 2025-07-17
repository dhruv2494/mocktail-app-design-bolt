import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Clock, Target, TrendingUp, ChevronRight, Award, Users, BookOpen, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface TestResult {
  testId: string;
  testTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  timeTaken: number;
  totalTime: number;
  rank: number;
  totalParticipants: number;
  percentile: number;
  subject: string;
}

export default function TestResultsScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');

  const testResult: TestResult = {
    testId: '1',
    testTitle: 'PSI Mock Test 1',
    totalQuestions: 100,
    correctAnswers: 72,
    incorrectAnswers: 18,
    unanswered: 10,
    totalMarks: 100,
    obtainedMarks: 72,
    percentage: 72,
    timeTaken: 5400, // 90 minutes in seconds
    totalTime: 7200, // 120 minutes in seconds
    rank: 15,
    totalParticipants: 1250,
    percentile: 85.2,
    subject: 'General Knowledge'
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getPerformanceText = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const handleViewSolutions = () => {
    router.push('/test/solutions');
  };

  const handleViewLeaderboard = () => {
    router.push('/test/leaderboard');
  };

  const handleRetakeTest = () => {
    router.push('/test/quiz');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Test Completed!</Text>
          <Text style={styles.headerSubtitle}>{testResult.testTitle}</Text>
        </View>
        
        <View style={styles.scoreCircle}>
          <Text style={styles.scorePercentage}>{testResult.percentage}%</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
      </LinearGradient>

      {/* Performance Badge */}
      <View style={styles.performanceBadge}>
        <LinearGradient
          colors={[getPerformanceColor(testResult.percentage), getPerformanceColor(testResult.percentage) + '80']}
          style={styles.performanceGradient}
        >
          <Award size={24} color="#FFFFFF" />
          <Text style={styles.performanceText}>{getPerformanceText(testResult.percentage)}</Text>
        </LinearGradient>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analysis' && styles.activeTab]}
          onPress={() => setActiveTab('analysis')}
        >
          <Text style={[styles.tabText, activeTab === 'analysis' && styles.activeTabText]}>
            Analysis
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' ? (
          <>
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <CheckCircle size={24} color="#10B981" />
                <Text style={styles.statNumber}>{testResult.correctAnswers}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              
              <View style={styles.statCard}>
                <XCircle size={24} color="#EF4444" />
                <Text style={styles.statNumber}>{testResult.incorrectAnswers}</Text>
                <Text style={styles.statLabel}>Incorrect</Text>
              </View>
              
              <View style={styles.statCard}>
                <AlertCircle size={24} color="#F59E0B" />
                <Text style={styles.statNumber}>{testResult.unanswered}</Text>
                <Text style={styles.statLabel}>Unanswered</Text>
              </View>
            </View>

            {/* Detailed Stats */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Trophy size={20} color="#FF6B35" />
                    <Text style={styles.detailLabel}>Rank</Text>
                  </View>
                  <Text style={styles.detailValue}>{testResult.rank} / {testResult.totalParticipants}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <TrendingUp size={20} color="#FF6B35" />
                    <Text style={styles.detailLabel}>Percentile</Text>
                  </View>
                  <Text style={styles.detailValue}>{testResult.percentile}%</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Clock size={20} color="#FF6B35" />
                    <Text style={styles.detailLabel}>Time Taken</Text>
                  </View>
                  <Text style={styles.detailValue}>{formatTime(testResult.timeTaken)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Target size={20} color="#FF6B35" />
                    <Text style={styles.detailLabel}>Marks</Text>
                  </View>
                  <Text style={styles.detailValue}>{testResult.obtainedMarks} / {testResult.totalMarks}</Text>
                </View>
              </View>
            </View>

            {/* Progress Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Performance Breakdown</Text>
              <View style={styles.progressChart}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressSegment, 
                      { 
                        width: `${(testResult.correctAnswers / testResult.totalQuestions) * 100}%`,
                        backgroundColor: '#10B981'
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.progressSegment, 
                      { 
                        width: `${(testResult.incorrectAnswers / testResult.totalQuestions) * 100}%`,
                        backgroundColor: '#EF4444'
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.progressSegment, 
                      { 
                        width: `${(testResult.unanswered / testResult.totalQuestions) * 100}%`,
                        backgroundColor: '#F59E0B'
                      }
                    ]} 
                  />
                </View>
                
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>Correct ({testResult.correctAnswers})</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>Incorrect ({testResult.incorrectAnswers})</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>Unanswered ({testResult.unanswered})</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Subject-wise Analysis */}
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>Subject-wise Performance</Text>
              
              <View style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <BookOpen size={20} color="#FF6B35" />
                  <Text style={styles.subjectName}>General Knowledge</Text>
                </View>
                <View style={styles.subjectStats}>
                  <Text style={styles.subjectScore}>18/25</Text>
                  <Text style={styles.subjectPercentage}>72%</Text>
                </View>
                <View style={styles.subjectProgress}>
                  <View style={[styles.subjectProgressBar, { width: '72%' }]} />
                </View>
              </View>

              <View style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <BookOpen size={20} color="#FF6B35" />
                  <Text style={styles.subjectName}>Mathematics</Text>
                </View>
                <View style={styles.subjectStats}>
                  <Text style={styles.subjectScore}>22/25</Text>
                  <Text style={styles.subjectPercentage}>88%</Text>
                </View>
                <View style={styles.subjectProgress}>
                  <View style={[styles.subjectProgressBar, { width: '88%' }]} />
                </View>
              </View>

              <View style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <BookOpen size={20} color="#FF6B35" />
                  <Text style={styles.subjectName}>Reasoning</Text>
                </View>
                <View style={styles.subjectStats}>
                  <Text style={styles.subjectScore}>16/25</Text>
                  <Text style={styles.subjectPercentage}>64%</Text>
                </View>
                <View style={styles.subjectProgress}>
                  <View style={[styles.subjectProgressBar, { width: '64%' }]} />
                </View>
              </View>

              <View style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <BookOpen size={20} color="#FF6B35" />
                  <Text style={styles.subjectName}>English</Text>
                </View>
                <View style={styles.subjectStats}>
                  <Text style={styles.subjectScore}>16/25</Text>
                  <Text style={styles.subjectPercentage}>64%</Text>
                </View>
                <View style={styles.subjectProgress}>
                  <View style={[styles.subjectProgressBar, { width: '64%' }]} />
                </View>
              </View>
            </View>

            {/* Time Analysis */}
            <View style={styles.timeAnalysisContainer}>
              <Text style={styles.analysisTitle}>Time Analysis</Text>
              <View style={styles.timeCard}>
                <Text style={styles.timeLabel}>Average Time per Question</Text>
                <Text style={styles.timeValue}>{Math.round(testResult.timeTaken / testResult.totalQuestions)}s</Text>
              </View>
              <View style={styles.timeCard}>
                <Text style={styles.timeLabel}>Time Saved</Text>
                <Text style={styles.timeValue}>{formatTime(testResult.totalTime - testResult.timeTaken)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleViewSolutions}>
          <BookOpen size={20} color="#FF6B35" />
          <Text style={styles.actionButtonText}>View Solutions</Text>
          <ChevronRight size={16} color="#FF6B35" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleViewLeaderboard}>
          <Trophy size={20} color="#FF6B35" />
          <Text style={styles.actionButtonText}>View Leaderboard</Text>
          <ChevronRight size={16} color="#FF6B35" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetakeTest}>
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.retakeGradient}
          >
            <Text style={styles.retakeButtonText}>Retake Test</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 30,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scorePercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  performanceBadge: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 20,
  },
  performanceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  performanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  progressChart: {
    marginBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressSegment: {
    height: '100%',
  },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  analysisContainer: {
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 8,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectScore: {
    fontSize: 14,
    color: '#6B7280',
  },
  subjectPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  subjectProgress: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  subjectProgressBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
  },
  timeAnalysisContainer: {
    marginBottom: 20,
  },
  timeCard: {
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
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B35',
    flex: 1,
    marginLeft: 12,
  },
  retakeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retakeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});