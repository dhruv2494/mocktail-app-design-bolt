import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  Home,
  RotateCcw,
  Share2,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Minus,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { useGetTestResultsQuery } from '@/store/api/testApi';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTheme } from '@/theme';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

export default function ResultsScreen() {
  const router = useRouter();
  const { testUuid } = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const Colors = getTheme(isDarkMode);

  const [showSolutions, setShowSolutions] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<{ [key: string]: boolean }>({});

  // Get the session UUID from navigation params or derive from test results
  const sessionUuid = 'current'; // This should come from the quiz session

  const {
    data: resultsData,
    isLoading,
    error,
    refetch,
  } = useGetTestResultsQuery(sessionUuid);

  const handleRetakeTest = () => {
    router.push(`/quiz/${testUuid}`);
  };

  const handleGoHome = () => {
    router.push('/(tabs)/');
  };

  const handleShareResults = async () => {
    if (!resultsData?.data) return;

    const { summary } = resultsData.data;
    
    try {
      await Share.share({
        message: `${t.results.shareMessage}\n\n${t.results.score}: ${summary.obtained_marks}/${summary.total_marks} (${summary.percentage.toFixed(1)}%)\n${t.results.correct}: ${summary.correct_answers}/${summary.total_questions}\n${t.results.timeTaken}: ${summary.time_taken_minutes} ${t.results.minutes}\n\n${t.app.downloadApp}`,
      });
    } catch (error) {
      // Handle share error
    }
  };

  const handleRevealAnswer = (questionUuid: string) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [questionUuid]: true,
    }));
  };

  const handleHideAnswer = (questionUuid: string) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [questionUuid]: false,
    }));
  };

  const toggleAllAnswers = (reveal: boolean) => {
    if (!resultsData?.data) return;
    
    const newRevealedState: { [key: string]: boolean } = {};
    resultsData.data.answers.forEach(answer => {
      newRevealedState[answer.question.uuid] = reveal;
    });
    setRevealedAnswers(newRevealedState);
  };

  const getResultColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 60) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const getResultIcon = (percentage: number) => {
    if (percentage >= 80) return Trophy;
    if (percentage >= 60) return TrendingUp;
    return RotateCcw;
  };

  const renderResultCard = () => {
    if (!resultsData?.data) return null;

    const { summary, session } = resultsData.data;
    const ResultIcon = getResultIcon(summary.percentage);
    const resultColor = getResultColor(summary.percentage);

    return (
      <View style={[styles.resultCard, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}>
        <View style={[styles.resultHeader, { backgroundColor: resultColor + '10' }]}>
          <ResultIcon size={48} color={resultColor} />
          <Text style={[styles.resultTitle, { color: Colors.text }]}>
            {summary.is_passed ? t.results.congratulations : t.results.betterLuckNextTime}
          </Text>
          <Text style={[styles.resultSubtitle, { color: Colors.textSecondary }]}>
            {summary.is_passed ? t.results.youPassed : t.results.youDidNotPass}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: resultColor }]}>
            {summary.percentage.toFixed(1)}%
          </Text>
          <Text style={[styles.scoreSubtext, { color: Colors.textSecondary }]}>
            {summary.obtained_marks}/{summary.total_marks} {t.results.marks}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <CheckCircle size={24} color={Colors.success} />
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {summary.correct_answers}
            </Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
              {t.results.correct}
            </Text>
          </View>

          <View style={styles.statItem}>
            <XCircle size={24} color={Colors.error} />
            <Text style={[styles.statValue, { color: Colors.error }]}>
              {summary.wrong_answers}
            </Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
              {t.results.wrong}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Minus size={24} color={Colors.textSecondary} />
            <Text style={[styles.statValue, { color: Colors.textSecondary }]}>
              {summary.unanswered_questions}
            </Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
              {t.results.unanswered}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Clock size={24} color={Colors.primary} />
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {summary.time_taken_minutes}
            </Text>
            <Text style={[styles.statLabel, { color: Colors.textSecondary }]}>
              {t.results.minutes}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSolutionsToggle = () => (
    <View style={styles.solutionsToggleContainer}>
      <TouchableOpacity
        style={[styles.solutionsToggle, { backgroundColor: Colors.cardBackground, borderColor: Colors.border }]}
        onPress={() => setShowSolutions(!showSolutions)}
      >
        <Text style={[styles.solutionsToggleText, { color: Colors.text }]}>
          {showSolutions ? t.results.hideSolutions : t.results.showSolutions}
        </Text>
        {showSolutions ? (
          <EyeOff size={20} color={Colors.textSecondary} />
        ) : (
          <Eye size={20} color={Colors.textSecondary} />
        )}
      </TouchableOpacity>

      {showSolutions && (
        <View style={styles.answerToggleButtons}>
          <TouchableOpacity
            style={[styles.answerToggleButton, { backgroundColor: Colors.success + '20', borderColor: Colors.success }]}
            onPress={() => toggleAllAnswers(true)}
          >
            <Eye size={16} color={Colors.success} />
            <Text style={[styles.answerToggleText, { color: Colors.success }]}>
              {t.results.showAllAnswers}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.answerToggleButton, { backgroundColor: Colors.textSecondary + '20', borderColor: Colors.textSecondary }]}
            onPress={() => toggleAllAnswers(false)}
          >
            <EyeOff size={16} color={Colors.textSecondary} />
            <Text style={[styles.answerToggleText, { color: Colors.textSecondary }]}>
              {t.results.hideAllAnswers}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSolutions = () => {
    if (!showSolutions || !resultsData?.data) return null;

    const { answers } = resultsData.data;

    return (
      <View style={styles.solutionsContainer}>
        {answers.map((answer, index) => {
          const question = answer.question;
          const questionText = currentLanguage === 'gu' && question.question_text_gujarati
            ? question.question_text_gujarati
            : question.question_text;

          const options = [
            {
              key: 'A',
              text: currentLanguage === 'gu' && question.option_a_gujarati
                ? question.option_a_gujarati
                : question.option_a,
            },
            {
              key: 'B',
              text: currentLanguage === 'gu' && question.option_b_gujarati
                ? question.option_b_gujarati
                : question.option_b,
            },
            {
              key: 'C',
              text: currentLanguage === 'gu' && question.option_c_gujarati
                ? question.option_c_gujarati
                : question.option_c,
            },
            {
              key: 'D',
              text: currentLanguage === 'gu' && question.option_d_gujarati
                ? question.option_d_gujarati
                : question.option_d,
            },
          ];

          const explanation = currentLanguage === 'gu' && question.explanation_gujarati
            ? question.explanation_gujarati
            : question.explanation;

          const isCorrect = answer.is_correct;
          const userAnswer = answer.selected_answer;
          const correctAnswer = question.correct_answer;
          const isAnswerRevealed = revealedAnswers[question.uuid] || false;

          return (
            <View
              key={answer.uuid}
              style={[
                styles.solutionCard,
                {
                  backgroundColor: Colors.cardBackground,
                  borderColor: isCorrect ? Colors.success + '30' : Colors.error + '30',
                },
              ]}
            >
              <View style={styles.solutionHeader}>
                <Text style={[styles.solutionNumber, { color: Colors.primary }]}>
                  {t.results.question} {index + 1}
                </Text>
                <View style={[
                  styles.solutionStatus,
                  {
                    backgroundColor: isCorrect ? Colors.success + '20' : Colors.error + '20',
                  },
                ]}>
                  {isCorrect ? (
                    <CheckCircle size={16} color={Colors.success} />
                  ) : (
                    <XCircle size={16} color={Colors.error} />
                  )}
                  <Text style={[
                    styles.solutionStatusText,
                    { color: isCorrect ? Colors.success : Colors.error },
                  ]}>
                    {isCorrect ? t.results.correct : t.results.incorrect}
                  </Text>
                </View>
              </View>

              <Text style={[styles.solutionQuestion, { color: Colors.text }]}>
                {questionText}
              </Text>

              {/* User's Selected Answer (if any) */}
              {userAnswer && (
                <View style={[styles.userAnswerContainer, { backgroundColor: Colors.background }]}>
                  <Text style={[styles.userAnswerLabel, { color: Colors.textSecondary }]}>
                    {t.results.yourAnswer}:
                  </Text>
                  <Text style={[
                    styles.userAnswerText, 
                    { 
                      color: isCorrect ? Colors.success : Colors.error,
                      fontWeight: '600',
                    }
                  ]}>
                    {userAnswer}. {options.find(opt => opt.key === userAnswer)?.text}
                  </Text>
                </View>
              )}

              {/* Show Answer Button or Revealed Answer */}
              {!isAnswerRevealed ? (
                <View style={styles.showAnswerContainer}>
                  <TouchableOpacity
                    style={[styles.showAnswerButton, { backgroundColor: Colors.primary }]}
                    onPress={() => handleRevealAnswer(question.uuid)}
                  >
                    <Eye size={16} color="#fff" />
                    <Text style={styles.showAnswerButtonText}>
                      {t.results.showCorrectAnswer}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.showAnswerHint, { color: Colors.textSecondary }]}>
                    {t.results.showAnswerHint}
                  </Text>
                </View>
              ) : (
                <View>
                  {/* Correct Answer Options */}
                  <View style={styles.solutionOptions}>
                    {options.map((option) => {
                      const isUserChoice = userAnswer === option.key;
                      const isCorrectOption = correctAnswer === option.key;

                      let optionStyle = {};
                      let textColor = Colors.text;

                      if (isCorrectOption) {
                        optionStyle = { backgroundColor: Colors.success + '20', borderColor: Colors.success };
                        textColor = Colors.success;
                      } else if (isUserChoice && !isCorrectOption) {
                        optionStyle = { backgroundColor: Colors.error + '20', borderColor: Colors.error };
                        textColor = Colors.error;
                      } else {
                        optionStyle = { backgroundColor: Colors.background, borderColor: Colors.border };
                      }

                      return (
                        <View
                          key={option.key}
                          style={[styles.solutionOption, optionStyle]}
                        >
                          <Text style={[styles.solutionOptionKey, { color: textColor }]}>
                            {option.key}.
                          </Text>
                          <Text style={[styles.solutionOptionText, { color: textColor }]}>
                            {option.text}
                          </Text>
                          {isCorrectOption && (
                            <CheckCircle size={16} color={Colors.success} />
                          )}
                          {isUserChoice && !isCorrectOption && (
                            <XCircle size={16} color={Colors.error} />
                          )}
                        </View>
                      );
                    })}
                  </View>

                  {/* Explanation */}
                  {explanation && (
                    <View style={[styles.explanationContainer, { backgroundColor: Colors.background }]}>
                      <Text style={[styles.explanationTitle, { color: Colors.primary }]}>
                        {t.results.explanation}:
                      </Text>
                      <Text style={[styles.explanationText, { color: Colors.textSecondary }]}>
                        {explanation}
                      </Text>
                    </View>
                  )}

                  {/* Hide Answer Button */}
                  <TouchableOpacity
                    style={[styles.hideAnswerButton, { borderColor: Colors.border }]}
                    onPress={() => handleHideAnswer(question.uuid)}
                  >
                    <EyeOff size={16} color={Colors.textSecondary} />
                    <Text style={[styles.hideAnswerButtonText, { color: Colors.textSecondary }]}>
                      {t.results.hideAnswer}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.solutionMeta}>
                <Text style={[styles.solutionMetaText, { color: Colors.textSecondary }]}>
                  {t.results.marks}: {isCorrect ? question.marks : 0}/{question.marks}
                </Text>
                {answer.time_taken_seconds && (
                  <Text style={[styles.solutionMetaText, { color: Colors.textSecondary }]}>
                    {t.results.timeTaken}: {Math.ceil(answer.time_taken_seconds / 60)} {t.results.minutes}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
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

  if (error || !resultsData?.data) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors.error }]}>
            {t.results.loadError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors.primary }]}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>{t.common.retry}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderResultCard()}
        {renderSolutionsToggle()}
        {renderSolutions()}
      </ScrollView>

      <View style={[styles.actions, { backgroundColor: Colors.cardBackground, borderTopColor: Colors.border }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton, { borderColor: Colors.border }]}
          onPress={handleShareResults}
        >
          <Share2 size={20} color={Colors.text} />
          <Text style={[styles.actionButtonText, { color: Colors.text }]}>
            {t.results.share}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton, { borderColor: Colors.border }]}
          onPress={handleRetakeTest}
        >
          <RotateCcw size={20} color={Colors.text} />
          <Text style={[styles.actionButtonText, { color: Colors.text }]}>
            {t.results.retake}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton, { backgroundColor: Colors.primary }]}
          onPress={handleGoHome}
        >
          <Home size={20} color="#fff" />
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>
            {t.results.goHome}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreSubtext: {
    fontSize: 16,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  solutionsToggleContainer: {
    marginBottom: 16,
  },
  solutionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  solutionsToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  answerToggleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  answerToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  answerToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  solutionsContainer: {
    gap: 16,
  },
  solutionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  solutionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  solutionNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  solutionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  solutionStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  solutionQuestion: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  solutionOptions: {
    gap: 8,
    marginBottom: 12,
  },
  solutionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  solutionOptionKey: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  solutionOptionText: {
    fontSize: 14,
    flex: 1,
  },
  explanationContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  solutionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  solutionMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButton: {},
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 16,
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
  userAnswerContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userAnswerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  userAnswerText: {
    fontSize: 16,
    lineHeight: 22,
  },
  showAnswerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  showAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
  },
  showAnswerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  showAnswerHint: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  hideAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 12,
    gap: 6,
  },
  hideAnswerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});