import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ChevronLeft, 
  Clock, 
  Pause, 
  Play, 
  CheckCircle,
  Circle,
  AlertTriangle,
  Flag
} from 'lucide-react-native';
import {
  useGetTestByIdQuery,
  useGetQuestionsByTestQuery,
  useStartTestSessionMutation,
  usePauseTestSessionMutation,
  useResumeTestSessionMutation,
  useSubmitTestSessionMutation,
  useSubmitAnswerMutation,
  useGetCurrentTestSessionQuery,
  Test,
  Question,
  TestSession,
} from '@/store/api/testApi';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTheme } from '@/theme';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';

interface QuizState {
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  timeRemaining: number;
  isPaused: boolean;
  isSubmitting: boolean;
}

export default function QuizScreen() {
  const router = useRouter();
  const { testUuid } = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const Colors = getTheme(isDarkMode);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 0,
    isPaused: false,
    isSubmitting: false,
  });

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  // API hooks
  const {
    data: testData,
    isLoading: testLoading,
  } = useGetTestByIdQuery(testUuid as string);

  const {
    data: questionsData,
    isLoading: questionsLoading,
  } = useGetQuestionsByTestQuery(testUuid as string);

  const {
    data: sessionData,
    refetch: refetchSession,
  } = useGetCurrentTestSessionQuery(testUuid as string);

  const [startSession] = useStartTestSessionMutation();
  const [pauseSession] = usePauseTestSessionMutation();
  const [resumeSession] = useResumeTestSessionMutation();
  const [submitSession] = useSubmitTestSessionMutation();
  const [submitAnswer] = useSubmitAnswerMutation();

  const test = testData?.data;
  const questions = questionsData?.data?.questions || [];
  const session = sessionData?.data;

  // Initialize or resume session
  useEffect(() => {
    const initializeSession = async () => {
      if (!test) return;

      if (session && session.status === 'active') {
        // Resume existing session
        setQuizState(prev => ({
          ...prev,
          timeRemaining: session.remaining_time_minutes ? session.remaining_time_minutes * 60 : test.duration_minutes * 60,
        }));
      } else if (session && session.status === 'paused') {
        // Session is paused, show resume option
        Alert.alert(
          t.quiz.sessionPaused,
          t.quiz.sessionPausedMessage,
          [
            {
              text: t.quiz.resume,
              onPress: async () => {
                try {
                  await resumeSession({ sessionUuid: session.uuid }).unwrap();
                  setQuizState(prev => ({
                    ...prev,
                    isPaused: false,
                    timeRemaining: session.remaining_time_minutes ? session.remaining_time_minutes * 60 : test.duration_minutes * 60,
                  }));
                  refetchSession();
                } catch (error) {
                  Alert.alert(t.common.error, t.quiz.resumeError);
                }
              },
            },
          ]
        );
      } else {
        // Start new session
        try {
          const result = await startSession({ testUuid: testUuid as string }).unwrap();
          setQuizState(prev => ({
            ...prev,
            timeRemaining: test.duration_minutes * 60,
          }));
          refetchSession();
        } catch (error) {
          Alert.alert(t.common.error, t.quiz.startError);
          router.back();
        }
      }
    };

    initializeSession();
  }, [test, session]);

  // Timer logic
  useEffect(() => {
    if (quizState.timeRemaining > 0 && !quizState.isPaused && !quizState.isSubmitting) {
      timerRef.current = setInterval(() => {
        setQuizState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            // Auto-submit when time expires
            handleTimeExpired();
            return { ...prev, timeRemaining: 0 };
          }
          
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizState.timeRemaining, quizState.isPaused, quizState.isSubmitting]);

  // Back handler
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleTimeExpired = async () => {
    if (test?.auto_submit_on_expiry && session) {
      try {
        setQuizState(prev => ({ ...prev, isSubmitting: true }));
        await submitSession({ sessionUuid: session.uuid }).unwrap();
        Alert.alert(
          t.quiz.timeUp,
          t.quiz.timeUpMessage,
          [
            {
              text: t.common.ok,
              onPress: () => router.push(`/quiz/${testUuid}/results`),
            },
          ]
        );
      } catch (error) {
        Alert.alert(t.common.error, t.quiz.submitError);
      }
    } else {
      Alert.alert(t.quiz.timeUp, t.quiz.timeUpMessage);
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      t.quiz.exitQuiz,
      t.quiz.exitQuizMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.quiz.pauseAndExit,
          onPress: async () => {
            if (session) {
              try {
                await pauseSession({ sessionUuid: session.uuid }).unwrap();
                router.back();
              } catch (error) {
                router.back();
              }
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleAnswerSelect = async (questionId: string, answer: string) => {
    if (!session) return;

    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }));

    try {
      await submitAnswer({
        sessionUuid: session.uuid,
        questionUuid: questionId,
        selectedAnswer: answer,
      }).unwrap();
    } catch (error) {
      // Handle error silently, answer will be submitted with session
    }
  };

  const handlePauseResume = async () => {
    if (!session) return;

    try {
      if (quizState.isPaused) {
        await resumeSession({ sessionUuid: session.uuid }).unwrap();
        setQuizState(prev => ({ ...prev, isPaused: false }));
      } else {
        await pauseSession({ sessionUuid: session.uuid }).unwrap();
        setQuizState(prev => ({ ...prev, isPaused: true }));
      }
    } catch (error) {
      Alert.alert(t.common.error, t.quiz.pauseResumeError);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!session) return;

    setShowSubmitModal(false);
    setQuizState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await submitSession({ sessionUuid: session.uuid }).unwrap();
      router.push(`/quiz/${testUuid}/results`);
    } catch (error) {
      setQuizState(prev => ({ ...prev, isSubmitting: false }));
      Alert.alert(t.common.error, t.quiz.submitError);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (quizState.timeRemaining <= 300) return Colors.error; // Red when < 5 minutes
    if (quizState.timeRemaining <= 600) return Colors.warning; // Orange when < 10 minutes
    return Colors.text;
  };

  const renderQuestion = (question: Question, index: number) => {
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

    const selectedAnswer = quizState.answers[question.uuid];

    return (
      <View style={styles.questionContainer}>
        <Text style={[styles.questionNumber, { color: Colors.primary }]}>
          {t.quiz.question} {index + 1} {t.quiz.of} {questions.length}
        </Text>
        
        <Text style={[styles.questionText, { color: Colors.text }]}>
          {questionText}
        </Text>

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionButton,
                {
                  backgroundColor: selectedAnswer === option.key
                    ? Colors.primary + '20'
                    : Colors.cardBackground,
                  borderColor: selectedAnswer === option.key
                    ? Colors.primary
                    : Colors.border,
                },
              ]}
              onPress={() => handleAnswerSelect(question.uuid, option.key)}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionIndicator,
                  {
                    backgroundColor: selectedAnswer === option.key
                      ? Colors.primary
                      : 'transparent',
                    borderColor: Colors.primary,
                  },
                ]}>
                  {selectedAnswer === option.key && (
                    <CheckCircle size={16} color="#fff" />
                  )}
                </View>
                
                <Text style={[
                  styles.optionKey,
                  {
                    color: selectedAnswer === option.key
                      ? Colors.primary
                      : Colors.text,
                  },
                ]}>
                  {option.key}.
                </Text>
                
                <Text style={[
                  styles.optionText,
                  {
                    color: selectedAnswer === option.key
                      ? Colors.primary
                      : Colors.text,
                  },
                ]}>
                  {option.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderNavigationModal = () => (
    <Modal
      visible={showNavigationModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowNavigationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: Colors.cardBackground }]}>
          <Text style={[styles.modalTitle, { color: Colors.text }]}>
            {t.quiz.questionNavigation}
          </Text>
          
          <ScrollView style={styles.navigationGrid}>
            <View style={styles.navigationContainer}>
              {questions.map((question, index) => {
                const isAnswered = quizState.answers[question.uuid];
                const isCurrent = index === quizState.currentQuestionIndex;
                
                return (
                  <TouchableOpacity
                    key={question.uuid}
                    style={[
                      styles.navigationButton,
                      {
                        backgroundColor: isCurrent
                          ? Colors.primary
                          : isAnswered
                          ? Colors.success + '20'
                          : Colors.border + '20',
                        borderColor: isCurrent
                          ? Colors.primary
                          : isAnswered
                          ? Colors.success
                          : Colors.border,
                      },
                    ]}
                    onPress={() => {
                      setQuizState(prev => ({ ...prev, currentQuestionIndex: index }));
                      setShowNavigationModal(false);
                    }}
                  >
                    <Text style={[
                      styles.navigationButtonText,
                      {
                        color: isCurrent
                          ? '#fff'
                          : isAnswered
                          ? Colors.success
                          : Colors.text,
                      },
                    ]}>
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.modalCloseButton, { backgroundColor: Colors.primary }]}
            onPress={() => setShowNavigationModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>{t.common.close}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSubmitModal = () => (
    <Modal
      visible={showSubmitModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSubmitModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: Colors.cardBackground }]}>
          <AlertTriangle size={48} color={Colors.warning} />
          
          <Text style={[styles.modalTitle, { color: Colors.text }]}>
            {t.quiz.submitQuiz}
          </Text>
          
          <Text style={[styles.modalMessage, { color: Colors.textSecondary }]}>
            {t.quiz.submitQuizMessage}
          </Text>
          
          <View style={styles.submitStats}>
            <Text style={[styles.submitStatsText, { color: Colors.text }]}>
              {t.quiz.answered}: {Object.keys(quizState.answers).length}/{questions.length}
            </Text>
            <Text style={[styles.submitStatsText, { color: Colors.text }]}>
              {t.quiz.timeRemaining}: {formatTime(quizState.timeRemaining)}
            </Text>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton, { borderColor: Colors.border }]}
              onPress={() => setShowSubmitModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: Colors.text }]}>
                {t.common.cancel}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSubmitButton, { backgroundColor: Colors.primary }]}
              onPress={handleSubmitQuiz}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                {t.quiz.submit}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (testLoading || questionsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <SkeletonLoader />
      </SafeAreaView>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors.error }]}>
            {t.quiz.loadError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>{t.common.goBack}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const answeredCount = Object.keys(quizState.answers).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.testTitle, { color: Colors.text }]} numberOfLines={1}>
            {currentLanguage === 'gu' && test.title_gujarati ? test.title_gujarati : test.title}
          </Text>
          
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: Colors.textSecondary }]}>
              {answeredCount}/{questions.length} {t.quiz.answered}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: Colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: Colors.primary,
                    width: `${(answeredCount / questions.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <View style={[styles.timerContainer, { backgroundColor: Colors.cardBackground }]}>
            <Clock size={16} color={getTimeColor()} />
            <Text style={[styles.timerText, { color: getTimeColor() }]}>
              {formatTime(quizState.timeRemaining)}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.pauseButton, { backgroundColor: Colors.cardBackground }]}
            onPress={handlePauseResume}
          >
            {quizState.isPaused ? (
              <Play size={16} color={Colors.primary} />
            ) : (
              <Pause size={16} color={Colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderQuestion(currentQuestion, quizState.currentQuestionIndex)}
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navigation, { borderTopColor: Colors.border, backgroundColor: Colors.cardBackground }]}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: Colors.border + '30' }]}
          onPress={() => setShowNavigationModal(true)}
        >
          <Flag size={16} color={Colors.primary} />
          <Text style={[styles.navButtonText, { color: Colors.primary }]}>
            {t.quiz.navigate}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.navCenter}>
          <TouchableOpacity
            style={[
              styles.navButton,
              quizState.currentQuestionIndex === 0 && styles.navButtonDisabled,
              { backgroundColor: Colors.border + '30' }
            ]}
            disabled={quizState.currentQuestionIndex === 0}
            onPress={() =>
              setQuizState(prev => ({
                ...prev,
                currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
              }))
            }
          >
            <Text style={[
              styles.navButtonText,
              { color: quizState.currentQuestionIndex === 0 ? Colors.textSecondary : Colors.text }
            ]}>
              {t.quiz.previous}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.navButton,
              quizState.currentQuestionIndex === questions.length - 1 && styles.navButtonDisabled,
              { backgroundColor: Colors.border + '30' }
            ]}
            disabled={quizState.currentQuestionIndex === questions.length - 1}
            onPress={() =>
              setQuizState(prev => ({
                ...prev,
                currentQuestionIndex: Math.min(questions.length - 1, prev.currentQuestionIndex + 1),
              }))
            }
          >
            <Text style={[
              styles.navButtonText,
              { color: quizState.currentQuestionIndex === questions.length - 1 ? Colors.textSecondary : Colors.text }
            ]}>
              {t.quiz.next}
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: Colors.primary }]}
          onPress={() => setShowSubmitModal(true)}
        >
          <Text style={styles.submitButtonText}>{t.quiz.submit}</Text>
        </TouchableOpacity>
      </View>

      {renderNavigationModal()}
      {renderSubmitModal()}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    marginRight: 12,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pauseButton: {
    padding: 8,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionContainer: {
    paddingVertical: 20,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionKey: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  navCenter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  submitStats: {
    alignSelf: 'stretch',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 20,
  },
  submitStatsText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    borderWidth: 1,
  },
  modalSubmitButton: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  navigationGrid: {
    maxHeight: 300,
    alignSelf: 'stretch',
    marginVertical: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  navigationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  navigationButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
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
});