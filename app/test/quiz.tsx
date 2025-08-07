import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Flag, ChevronLeft, ChevronRight, Grid3x3 as Grid3X3, Pause, Play, Globe, BookOpen, AlertCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/shared';
import { 
  useStartTestMutation,
  useGetTestQuestionsQuery,
  // useSaveAnswerMutation, // Temporarily disabled due to auth issues
  usePauseResumeTestMutation,
  useSubmitTestMutation,
  useGetTestByUuidQuery,
  QuizQuestion,
  QuizSession
} from '@/store/api/quizApi';

export default function QuizScreen() {
  const params = useLocalSearchParams();
  const { testId, seriesId, testType, title } = params;
  
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
  const styles = getStyles(Colors);
  
  // Get auth state
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  
  // API hooks
  const [startTest, { isLoading: startingTest }] = useStartTestMutation();
  // const [saveAnswer] = useSaveAnswerMutation(); // Temporarily disabled due to auth issues
  const [pauseResumeTest] = usePauseResumeTestMutation();
  const [submitTest, { isLoading: submittingTest }] = useSubmitTestMutation();
  
  // Get test information
  const { data: testData, isLoading: loadingTest } = useGetTestByUuidQuery(testId as string, {
    skip: !testId,
  });
  
  // Get test questions (will be fetched after starting test)
  const { data: questionsData, isLoading: loadingQuestions } = useGetTestQuestionsQuery(testId as string, {
    skip: !testId || !session,
  });

  const availableLanguages = ['English', 'Hindi', 'Kannada', 'Telugu'];

  // Initialize test when testData is available
  useEffect(() => {
    const initializeTest = async () => {
      if (!testData?.data || !testId) return;
      
      setTestInfo(testData.data);

      // TEMPORARY: Skip authentication check for testing
      // TODO: Re-enable authentication when login flow is fixed
      console.log('🔥 TEMPORARY: Skipping authentication check for testing');
      
      // // Check authentication before starting test
      // if (!isAuthenticated || !token) {
      //   Alert.alert(
      //     'Authentication Required',
      //     'Please log in to start the test.',
      //     [
      //       {
      //         text: 'Login',
      //         onPress: () => router.push('/(auth)/login')
      //       },
      //       {
      //         text: 'Cancel',
      //         onPress: () => router.back(),
      //         style: 'cancel'
      //       }
      //     ]
      //   );
      //   return;
      // }

      // Start test session
      try {
        const result = await startTest({
          testUuid: testId as string,
          language: selectedLanguage.toLowerCase(),
        }).unwrap();

        // Create session object from response
        const sessionData = {
          id: 0, // Will be set by backend
          uuid: result.data.session_id,
          user_id: 0,
          test_id: 0,
          start_time: result.data.started_at,
          status: result.data.status as any,
          time_remaining: result.data.time_remaining,
          total_time_spent: 0,
          is_demo: result.data.is_demo,
          language: selectedLanguage.toLowerCase(),
          created_at: result.data.started_at,
          updated_at: result.data.started_at,
        };

        setSession(sessionData);
        setTimeRemaining(result.data.time_remaining);

        if (result.data.is_resuming) {
          // Handle resuming logic here
          console.log('Resuming existing session');
        }
      } catch (error: any) {
        console.error('Error starting test:', error);
        Alert.alert(
          'Error',
          error?.data?.message || 'Failed to start the test. Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    };

    initializeTest();
  }, [testData, testId, selectedLanguage, isAuthenticated, token]);

  // Load questions after session is created
  useEffect(() => {
    if (questionsData?.data?.questions) {
      setQuestions(questionsData.data.questions.map(q => ({
        ...q,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d,
        },
        options_gujarati: q.option_a_gujarati ? {
          A: q.option_a_gujarati,
          B: q.option_b_gujarati,
          C: q.option_c_gujarati,
          D: q.option_d_gujarati,
        } : undefined,
      })));
    }
  }, [questionsData]);

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
    
    // Update local state immediately for better UX
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));

    // TEMPORARY: Save to backend disabled due to auth issues
    // TODO: Re-enable when backend answer API is fixed
    console.log('💾 Answer selected (not saved to backend yet):', {
      questionId,
      option,
      sessionId: session.uuid
    });
    
    // Uncomment when backend is ready:
    // try {
    //   await saveAnswer({
    //     session_uuid: session.uuid,
    //     question_id: questionId,
    //     selected_option: option,
    //     time_spent: 0,
    //     is_flagged: flaggedQuestions.has(questionId.toString()),
    //   });
    // } catch (error) {
    //   console.error('Error saving answer:', error);
    // }
  };

  const handleFlagQuestion = async () => {
    if (!session || !questions[currentQuestion]) return;
    
    const questionId = questions[currentQuestion].id;
    const isFlagged = flaggedQuestions.has(questionId.toString());
    
    // Update local state
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (isFlagged) {
        newSet.delete(questionId.toString());
      } else {
        newSet.add(questionId.toString());
      }
      return newSet;
    });

    // TEMPORARY: Flag save to backend disabled due to auth issues  
    // TODO: Re-enable when backend answer API is fixed
    console.log('🚩 Question flagged (not saved to backend yet):', {
      questionId,
      flagged: !isFlagged,
      sessionId: session.uuid
    });
    
    // Uncomment when backend is ready:
    // try {
    //   await saveAnswer({
    //     session_uuid: session.uuid,
    //     question_id: questionId,
    //     selected_option: selectedAnswers[questionId] || null,
    //     time_spent: 0,
    //     is_flagged: !isFlagged,
    //   });
    // } catch (error) {
    //   console.error('Error saving flag status:', error);
    // }
  };

  const handlePauseResume = async () => {
    if (!session) return;
    
    try {
      const result = await pauseResumeTest({
        session_uuid: session.uuid,
        action: isPaused ? 'resume' : 'pause',
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
              setSubmittingTest(true);
              console.log('🔄 TEMPORARY: Mocking test submit for testing');
              console.log('🔄 Setting submittingTest to true');
              
              // Small delay to show the loading state
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Calculate mock results based on selected answers
              const totalQuestions = questions.length;
              const answeredQuestions = Object.keys(selectedAnswers).length;
              const unanswered = totalQuestions - answeredQuestions;
              
              // Mock some correct answers for demo
              const correctAnswers = Math.floor(answeredQuestions * 0.8); // 80% correct
              const wrongAnswers = answeredQuestions - correctAnswers;
              const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100) : 0;
              
              const result = {
                data: {
                  total_score: correctAnswers * 4, // 4 points per correct answer
                  percentage: Math.round(percentage),
                  passed: percentage >= 50,
                  correct_answers: correctAnswers,
                  wrong_answers: wrongAnswers,
                  unanswered: unanswered
                }
              };
              
              console.log('🎯 Mock results:', result.data);
              console.log('📍 About to navigate to results screen');
              console.log('📍 Navigation params:', {
                sessionId: session.uuid,
                score: result.data.total_score.toString(),
                percentage: result.data.percentage.toString(),
                passed: result.data.passed.toString(),
                correctAnswers: result.data.correct_answers.toString(),
                wrongAnswers: result.data.wrong_answers.toString(),
                unanswered: result.data.unanswered.toString(),
                testTitle: testInfo?.title || title || 'Quiz',
                testId: testId,
              });
              
              // TODO: Replace with real API call when backend is fixed
              // const result = await submitTest({
              //   session_uuid: session.uuid,
              //   answers,
              //   submitted_at: new Date().toISOString(),
              //   time_taken: (testInfo?.duration_minutes * 60 || 3600) - timeRemaining,
              // }).unwrap();

              // Navigate to results with the result data
              router.push({
                pathname: '/test/results',
                params: {
                  sessionId: session.uuid,
                  score: result.data.total_score.toString(),
                  percentage: result.data.percentage.toString(),
                  passed: result.data.passed.toString(),
                  correctAnswers: result.data.correct_answers.toString(),
                  wrongAnswers: result.data.wrong_answers.toString(),
                  unanswered: result.data.unanswered.toString(),
                  testTitle: testInfo?.title || title || 'Quiz',
                  testId: testId,
                },
              });
            } catch (error) {
              console.error('❌ Error submitting quiz:', error);
              console.error('❌ Error details:', JSON.stringify(error, null, 2));
              Alert.alert('Error', 'Failed to submit the quiz. Please try again.');
              return; // Don't navigate if there's an error
            } finally {
              setSubmittingTest(false);
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
    if (flaggedQuestions.has(questionId.toString())) return 'flagged';
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
          {startingTest ? 'Starting Test...' : loadingTest ? 'Loading Test...' : loadingQuestions ? 'Loading Questions...' : 'Loading...'}
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

  // Debug logging
  console.log('🔍 Quiz Debug - loadingTest:', loadingTest);
  console.log('🔍 Quiz Debug - startingTest:', startingTest);  
  console.log('🔍 Quiz Debug - loadingQuestions:', loadingQuestions);
  console.log('🔍 Quiz Debug - isAuthenticated:', isAuthenticated);
  console.log('🔍 Quiz Debug - session:', !!session);
  console.log('🔍 Quiz Debug - testData:', !!testData?.data);
  console.log('🔍 Quiz Debug - questions.length:', questions.length);

  // Show loading state while loading test or starting test
  if (loadingTest || startingTest || loadingQuestions) {
    console.log('🔍 Quiz Debug - Showing loader: API loading');
    return renderLoadingState();
  }

  // If authenticated but no session yet, keep loading
  if (isAuthenticated && !session && testData?.data) {
    console.log('🔍 Quiz Debug - Showing loader: Authenticated, waiting for session');
    return renderLoadingState();
  }

  // If session exists but no questions loaded yet
  if (session && questions.length === 0) {
    console.log('🔍 Quiz Debug - Showing loader: Session exists, waiting for questions');
    return renderLoadingState();
  }

  // TEMPORARY: Commented out login requirement for testing
  // // If not authenticated and test data loaded, show login prompt instead of loading
  // if (!isAuthenticated && testData?.data && !loadingTest && !startingTest) {
  //   console.log('🔍 Quiz Debug - Not authenticated, showing login prompt');
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <View style={[styles.centerContainer]}>
  //         <AlertCircle size={48} color={Colors.primary} />
  //         <Text style={[styles.errorTitle, { color: Colors.textPrimary }]}>
  //           Login Required
  //         </Text>
  //         <Text style={[styles.errorMessage, { color: Colors.textSubtle }]}>
  //           Please log in to start this test.
  //         </Text>
  //         <TouchableOpacity
  //           style={[styles.button, { backgroundColor: Colors.primary }]}
  //           onPress={() => router.push('/(auth)/login')}
  //         >
  //           <Text style={[styles.buttonText, { color: Colors.white }]}>
  //             Login
  //           </Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity
  //           style={[styles.button, { backgroundColor: Colors.surface, marginTop: 12 }]}
  //           onPress={() => router.back()}
  //         >
  //           <Text style={[styles.buttonText, { color: Colors.textPrimary }]}>
  //             Go Back
  //           </Text>
  //         </TouchableOpacity>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  // Show error state if there's no session or questions after loading
  if (!session && !loadingTest && !startingTest) {
    return renderErrorState('Failed to start the test session.');
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
              <Text style={styles.subjectText}>{questions[currentQuestion].subject || 'General'}</Text>
            </View>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: (questions[currentQuestion].difficulty === 'easy') ? Colors.badgeSuccessBg : 
                                 (questions[currentQuestion].difficulty === 'medium') ? Colors.premiumBadge : Colors.badgeDangerBg }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: (questions[currentQuestion].difficulty === 'easy') ? Colors.success : 
                         (questions[currentQuestion].difficulty === 'medium') ? Colors.premiumText : Colors.danger }
              ]}>
                {(questions[currentQuestion].difficulty || 'medium').charAt(0).toUpperCase() + (questions[currentQuestion].difficulty || 'medium').slice(1)}
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
            disabled={submittingTest}
          >
            <LinearGradient
              colors={[Colors.danger, Colors.danger]}
              style={styles.submitGradient}
            >
              {submittingTest ? (
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