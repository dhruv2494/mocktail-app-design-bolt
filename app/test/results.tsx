import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Clock, Target, TrendingUp, ChevronRight, Award, Users, BookOpen, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const Colors = getTheme(isDarkMode);

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

  // Additional performance metrics as per documentation
  const performanceMetrics = {
    accuracy: (testResult.correctAnswers / (testResult.correctAnswers + testResult.incorrectAnswers)) * 100,
    averageTimePerQuestion: testResult.timeTaken / testResult.totalQuestions,
    categoryWisePerformance: [
      { category: 'General Knowledge', attempted: 25, correct: 20, accuracy: 80 },
      { category: 'Reasoning', attempted: 25, correct: 18, accuracy: 72 },
      { category: 'Mathematics', attempted: 25, correct: 19, accuracy: 76 },
      { category: 'English', attempted: 25, correct: 15, accuracy: 60 }
    ],
    comparisonWithPreviousTests: {
      improvementPercent: 8.5,
      consistencyRating: 'Good'
    },
    recommendedFocusAreas: ['English Grammar', 'Speed Calculation', 'Current Affairs']
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
    // Home screen does not use colored badges, so always use Colors.primaryLight for highlights
    return Colors.primaryLight;
  };

  const getPerformanceText = (percentage: number) => {
    if (percentage >= 80) return t.results.excellent;
    if (percentage >= 60) return t.results.good;
    return t.results.needsImprovement;
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

  const styles = getStyles(Colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t.results.testCompleted}</Text>
          <Text style={styles.headerSubtitle}>{testResult.testTitle}</Text>
        </View>
        
        <View style={styles.scoreCircle}>
          <Text style={styles.scorePercentage}>{testResult.percentage}%</Text>
          <Text style={styles.scoreLabel}>{t.results.score}</Text>
        </View>
      </LinearGradient>

      {/* Performance Badge */}
      <View style={styles.performanceBadge}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.performanceGradient}
        >
          <Award size={24} color={Colors.white} />
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
            {t.results.overview}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analysis' && styles.activeTab]}
          onPress={() => setActiveTab('analysis')}
        >
          <Text style={[styles.tabText, activeTab === 'analysis' && styles.activeTabText]}>
            {t.results.analysis}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' ? (
          <>
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <CheckCircle size={24} color={Colors.success} />
                <Text style={styles.statNumber}>{testResult.correctAnswers}</Text>
                <Text style={styles.statLabel}>{t.results.correct}</Text>
              </View>
              
              <View style={styles.statCard}>
                <XCircle size={24} color={Colors.danger} />
                <Text style={styles.statNumber}>{testResult.incorrectAnswers}</Text>
                <Text style={styles.statLabel}>{t.results.incorrect}</Text>
              </View>
              
              <View style={styles.statCard}>
                <AlertCircle size={24} color={Colors.warning} />
                <Text style={styles.statNumber}>{testResult.unanswered}</Text>
                <Text style={styles.statLabel}>{t.results.unanswered}</Text>
              </View>
            </View>

            {/* Detailed Stats */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <CheckCircle size={20} color={Colors.primaryLight} />
                    <Text style={styles.detailLabel}>{t.results.correctAnswers}</Text>
                  </View>
                  <Text style={styles.detailValue}>{testResult.correctAnswers}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <XCircle size={20} color={Colors.accent} />
                    <Text style={styles.detailLabel}>{t.results.incorrectAnswers}</Text>
                  </View>
                  <Text style={styles.detailValue}>{testResult.incorrectAnswers}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <AlertCircle size={20} color={Colors.accent} />
                    <Text style={styles.detailLabel}>{t.results.unanswered}</Text>
                  </View>
                  <Text style={styles.detailValue}>{testResult.unanswered}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Target size={20} color={Colors.primaryLight} />
                  <Text style={styles.detailLabel}>{t.results.marks}</Text>
                </View>
              </View>
            </View>

            {/* Progress Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>{t.results.performanceBreakdown}</Text>
              <View style={styles.progressChart}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressSegment, 
                      { 
                        width: `${(testResult.correctAnswers / testResult.totalQuestions) * 100}%`,
                        backgroundColor: Colors.success
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.progressSegment, 
                      { 
                        width: `${(testResult.incorrectAnswers / testResult.totalQuestions) * 100}%`,
                        backgroundColor: Colors.danger
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.progressSegment, 
                      { 
                        width: `${(testResult.unanswered / testResult.totalQuestions) * 100}%`,
                        backgroundColor: Colors.warning
                      }
                    ]} 
                  />
                </View>
                
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                    <Text style={styles.legendText}>{t.results.correct} ({testResult.correctAnswers})</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
                    <Text style={styles.legendText}>{t.results.incorrect} ({testResult.incorrectAnswers})</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                    <Text style={styles.legendText}>{t.results.unanswered} ({testResult.unanswered})</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Subject-wise Analysis */}
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>{t.results.subjectWisePerformance}</Text>
              
              <View style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <BookOpen size={20} color={Colors.textLink} />
                  <Text style={styles.subjectName}>{t.results.subjects.generalKnowledge}</Text>
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
                  <BookOpen size={20} color={Colors.textLink} />
                  <Text style={styles.subjectName}>{t.results.subjects.mathematics}</Text>
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
                  <BookOpen size={20} color={Colors.textLink} />
                  <Text style={styles.subjectName}>{t.results.subjects.reasoning}</Text>
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
                  <BookOpen size={20} color={Colors.textLink} />
                  <Text style={styles.subjectName}>{t.results.subjects.english}</Text>
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
              <Text style={styles.analysisTitle}>{t.results.timeAnalysis}</Text>
              <View style={styles.timeCard}>
                <Text style={styles.timeLabel}>{t.results.avgTimePerQuestion}</Text>
                <Text style={styles.timeValue}>{Math.round(testResult.timeTaken / testResult.totalQuestions)}s</Text>
              </View>
              <View style={styles.timeCard}>
                <Text style={styles.timeLabel}>{t.results.timeSaved}</Text>
                <Text style={styles.timeValue}>{formatTime(testResult.totalTime - testResult.timeTaken)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleViewSolutions}>
          <BookOpen size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>{t.results.viewSolutions}</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleViewLeaderboard}>
          <Trophy size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>{t.results.viewLeaderboard}</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetakeTest}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            style={styles.retakeGradient}
          >
            <Text style={styles.retakeButtonText}>{t.results.retakeTest}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
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
    borderColor: Colors.white,
  },
  scorePercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.white,
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
    color: Colors.white,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
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
    backgroundColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSubtle,
  },
  activeTabText: {
    color: Colors.white,
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
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSubtle,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
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
    borderBottomColor: Colors.light,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
  chartContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  progressChart: {
    marginBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: Colors.light,
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
    color: Colors.textSubtle,
  },
  analysisContainer: {
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  subjectCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
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
    color: Colors.textPrimary,
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
    color: Colors.textSubtle,
  },
  subjectPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  subjectProgress: {
    height: 4,
    backgroundColor: Colors.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  subjectProgressBar: {
    height: '100%',
    backgroundColor: Colors.textLink,
  },
  timeAnalysisContainer: {
    marginBottom: 20,
  },
  timeCard: {
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
  timeLabel: {
    fontSize: 14,
    color: Colors.textSubtle,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.muted,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
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
    color: Colors.white,
  },
});