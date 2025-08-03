import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Flag, ChevronLeft, ChevronRight, Grid3x3 as Grid3X3, Pause, Play, Globe, BookOpen, AlertCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/shared';
import { 
  useStartQuizMutation,
  useGetSessionStatusQuery,
  useSaveAnswerMutation,
  usePauseResumeQuizMutation,
  useSubmitQuizMutation,
  useValidateQuizSessionQuery,
  QuizQuestion,
  QuizSession
} from '@/store/api/quizApi';

export default function QuizScreen() {
  const params = useLocalSearchParams();
  const { testId, testUuid, testTitle, seriesId, seriesUuid, testType, title, duration, totalQuestions, isDemo } = params;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isPaused, setIsPaused] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: 'A' | 'B' | 'C' | 'D' }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testInfo, setTestInfo] = useState<any>(null);
  
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const { t } = useLanguage();
  
  // API hooks
  const [startQuiz, { isLoading: startingQuiz }] = useStartQuizMutation();
  const [saveAnswer] = useSaveAnswerMutation();
  const [pauseResumeQuiz] = usePauseResumeQuizMutation();
  const [submitQuiz, { isLoading: submittingQuiz }] = useSubmitQuizMutation();
  
  // Validate quiz session on component mount
  const { data: validationData, isLoading: validatingSession } = useValidateQuizSessionQuery({
    test_id: testId as string,
    test_type: testType as string,
    series_id: seriesId as string,
  }, {
    skip: !testId || !testType,
  });

  const availableLanguages = ['English', 'Hindi', 'Kannada', 'Telugu'];

  // Initialize quiz when validation is complete
  useEffect(() => {
    const initializeQuiz = async () => {
      if (!validationData?.data || !testId || !testType) return;
      
      const validation = validationData.data;
      
      // Check if user can start the quiz
      if (!validation.can_start) {
        Alert.alert(
          'Cannot Start Quiz',
          validation.reason || 'You cannot start this quiz at the moment.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      // Check if there's an existing session to resume
      if (validation.existing_session) {
        // Resume existing session
        setSession(validation.existing_session as any);
        setTimeRemaining(validation.existing_session.time_remaining);
        // TODO: Load existing session data
        return;
      }

      // Start new quiz session
      try {
        const result = await startQuiz({
          test_id: testId as string,
          test_type: testType as string,
          series_id: seriesId as string,
          language: selectedLanguage,
        }).unwrap();

        setSession(result.data.session);
        setQuestions(result.data.questions);
        setTestInfo(result.data.test_info);
        setTimeRemaining(result.data.session.duration * 60); // Convert minutes to seconds
      } catch (error) {
        console.error('Error starting quiz:', error);
        Alert.alert(
          'Error',
          'Failed to start the quiz. Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    };

    initializeQuiz();
  }, [validationData, testId, testType, seriesId, selectedLanguage]);

  // Timer effect
  useEffect(() => {
    if (!isPaused && timeRemaining > 0 && session) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, timeRemaining, session]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = async (option: 'A' | 'B' | 'C' | 'D') => {
    if (!session || !questions[currentQuestion]) return;
    
    const questionId = questions[currentQuestion].id;
    const previousAnswer = selectedAnswers[questionId];
    
    // Update local state immediately for better UX
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));

    // Save to backend (auto-save)
    try {
      await saveAnswer({
        session_id: session.id,
        question_id: questionId,
        selected_option: option,
        time_spent: 0, // TODO: Track actual time spent on question
        is_flagged: flaggedQuestions.has(questionId),
        is_auto_save: true,
      });
    } catch (error) {
      console.error('Error saving answer:', error);
      // Could implement offline queue here
    }
  };

  const handleFlagQuestion = async () => {
    if (!session || !questions[currentQuestion]) return;
    
    const questionId = questions[currentQuestion].id;
    const isFlagged = flaggedQuestions.has(questionId);
    
    // Update local state
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (isFlagged) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });

    // Save flag status to backend
    try {
      await saveAnswer({
        session_id: session.id,
        question_id: questionId,
        selected_option: selectedAnswers[questionId] || null,
        time_spent: 0,
        is_flagged: !isFlagged,
        is_auto_save: true,
      });
    } catch (error) {
      console.error('Error saving flag status:', error);
    }
  };

  const handlePauseResume = async () => {
    if (!session || !session.can_pause) return;
    
    try {
      const result = await pauseResumeQuiz({
        session_id: session.id,
        action: isPaused ? 'resume' : 'pause',
        timestamp: new Date().toISOString(),
      }).unwrap();
      
      setIsPaused(result.data.status === 'paused');
      setTimeRemaining(result.data.time_remaining);
    } catch (error) {
      console.error('Error toggling pause/resume:', error);
      Alert.alert('Error', 'Failed to pause/resume the quiz.');
    }
  };

  const handleSubmitTest = async () => {
    if (!session) return;

    Alert.alert(
      'Submit Quiz',
      'Are you sure you want to submit your quiz? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Prepare answers in the required format
              const answers = questions.map(question => ({
                question_id: question.id,
                selected_option: selectedAnswers[question.id] || null,
                time_spent: 0, // TODO: Track actual time per question
                is_flagged: flaggedQuestions.has(question.id),
              }));

              const result = await submitQuiz({
                session_id: session.id,
                answers,
                submitted_at: new Date().toISOString(),
                time_taken: (session.duration * 60) - timeRemaining,
                is_manual_submit: true,
              }).unwrap();

              // Navigate to results with the result data
              router.push({
                pathname: '/test/results',
                params: {
                  resultId: result.data.result_id,
                  sessionId: session.id,
                  score: result.data.total_score.toString(),
                  percentage: result.data.percentage.toString(),
                  passed: result.data.passed.toString(),
                },
              });
            } catch (error) {
              console.error('Error submitting quiz:', error);
              Alert.alert('Error', 'Failed to submit the quiz. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getQuestionStatus = (questionIndex: number) => {
    if (!questions[questionIndex]) return 'unanswered';
    
    const questionId = questions[questionIndex].id;
    if (selectedAnswers[questionId] !== undefined) return 'answered';
    if (flaggedQuestions.has(questionId)) return 'flagged';
    if (questionIndex === currentQuestion) return 'current';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return Colors.success;
      case 'flagged': return Colors.warning;
      case 'current': return Colors.primary;
      default: return Colors.muted;
    }
  };

  const renderLoadingState = () => (
    <SafeAreaView style={styles.container}>
      <View style={[styles.centerContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: Colors.textPrimary }]}>
          {startingQuiz ? 'Starting Quiz...' : validatingSession ? 'Validating Session...' : 'Loading...'}
        </Text>
      </View>
    </SafeAreaView>
  );

  const renderErrorState = (message: string) => (
    <SafeAreaView style={styles.container}>
      <View style={[styles.centerContainer]}>
        <AlertCircle size={48} color={Colors.danger} />
        <Text style={[styles.errorTitle, { color: Colors.textPrimary }]}>
          Error
        </Text>
        <Text style={[styles.errorMessage, { color: Colors.textSubtle }]}>
          {message}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: Colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderQuestionGrid = () => (
    <View style={styles.gridContainer}>
      <View style={styles.gridHeader}>
        <Text style={styles.gridTitle}>Question Navigator</Text>
        <TouchableOpacity onPress={() => setShowGrid(false)}>
          <Text style={styles.gridClose}>Close</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.legendText}>Answered</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
          <Text style={styles.legendText}>Flagged</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Current</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.muted }]} />
          <Text style={styles.legendText}>Unanswered</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {questions.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.gridItem,
              { backgroundColor: getStatusColor(getQuestionStatus(index)) }
            ]}
            onPress={() => {
              setCurrentQuestion(index);
              setShowGrid(false);
            }}
          >
            <Text style={[
              styles.gridItemText,
              getQuestionStatus(index) === 'unanswered' && { color: Colors.textSubtle }
            ]}>
              {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Show loading state while validating or starting quiz
  if (validatingSession || startingQuiz || !session || questions.length === 0) {
    return renderLoadingState();
  }

  // Show error state if there's no session or questions after loading
  if (!session && !validatingSession && !startingQuiz) {
    return renderErrorState('Failed to start the quiz session.');
  }

  if (questions.length === 0 && session) {
    return renderErrorState('No questions available for this quiz.');
  }

  if (showGrid) {
    return (
      <SafeAreaView style={styles.container}>
        {renderQuestionGrid()}
      </SafeAreaView>
    );
  }

  const styles = getStyles(Colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.testTitle}>{testInfo?.title || title || 'Quiz'}</Text>
            <Text style={styles.questionCounter}>
              Question {currentQuestion + 1} of {questions.length}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <LanguageSelector />
        </View>
      </View>

      {/* Timer and Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.timerContainer}>
          <Clock size={16} color={timeRemaining < 300 ? Colors.danger : Colors.textSubtle} />
          <Text style={[
            styles.timerText,
            timeRemaining < 300 && styles.timerWarning
          ]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
        
        <View style={styles.controlButtons}>
          {session?.can_pause && (
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handlePauseResume}
            >
              {isPaused ? (
                <Play size={16} color={Colors.textSubtle} />
              ) : (
                <Pause size={16} color={Colors.textSubtle} />
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setShowGrid(true)}
          >
            <Grid3X3 size={16} color={Colors.textSubtle} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton,
              questions[currentQuestion] && flaggedQuestions.has(questions[currentQuestion].id) && styles.flaggedButton
            ]}
            onPress={handleFlagQuestion}
          >
            <Flag 
              size={16} 
              color={questions[currentQuestion] && flaggedQuestions.has(questions[currentQuestion].id) ? Colors.warning : Colors.textSubtle} 
              fill={questions[currentQuestion] && flaggedQuestions.has(questions[currentQuestion].id) ? Colors.warning : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <View style={styles.questionHeader}>
            <View style={styles.subjectBadge}>
              <BookOpen size={12} color={Colors.primary} />
              <Text style={styles.subjectText}>{questions[currentQuestion].subject}</Text>
            </View>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: questions[currentQuestion].difficulty === 'easy' ? Colors.badgeSuccessBg : 
                                 questions[currentQuestion].difficulty === 'medium' ? Colors.premiumBadge : Colors.badgeDangerBg }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: questions[currentQuestion].difficulty === 'easy' ? Colors.success : 
                         questions[currentQuestion].difficulty === 'medium' ? Colors.premiumText : Colors.danger }
              ]}>
                {questions[currentQuestion].difficulty.charAt(0).toUpperCase() + questions[currentQuestion].difficulty.slice(1)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.questionText}>
            {questions[currentQuestion].question_text}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {Object.entries(questions[currentQuestion].options).map(([key, option]) => {
            const isSelected = selectedAnswers[questions[currentQuestion].id] === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption
                ]}
                onPress={() => handleAnswerSelect(key as 'A' | 'B' | 'C' | 'D')}
              >
                <View style={[
                  styles.optionIndicator,
                  isSelected && styles.selectedIndicator
                ]}>
                  <Text style={[
                    styles.optionLetter,
                    isSelected && styles.selectedOptionLetter
                  ]}>
                    {key}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestion === 0 && styles.navButtonDisabled
          ]}
          onPress={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft size={20} color={currentQuestion === 0 ? Colors.gray400 : Colors.textPrimary} />
          <Text style={[
            styles.navButtonText,
            currentQuestion === 0 && styles.navButtonTextDisabled
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        {currentQuestion === questions.length - 1 ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitTest}
            disabled={submittingQuiz}
          >
            <LinearGradient
              colors={[Colors.danger, Colors.danger]}
              style={styles.submitGradient}
            >
              {submittingQuiz ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Submit Test</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <ChevronRight size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
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
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  questionCounter: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginLeft: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  timerWarning: {
    color: Colors.danger,
  },
  controlButtons: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light,
    margin: 4,
  },
  flaggedButton: {
    backgroundColor: Colors.premiumBadge,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.chip,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.muted,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.chip,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIndicator: {
    backgroundColor: Colors.primary,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  selectedOptionLetter: {
    color: Colors.white,
  },
  optionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.muted,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  navButtonTextDisabled: {
    color: Colors.gray400,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  gridContainer: {
    flex: 1,
    padding: 20,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gridTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  gridClose: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: -8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
  },
  gridItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});