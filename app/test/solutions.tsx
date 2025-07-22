import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CircleCheck as CheckCircle,
  Circle as XCircle,
  CircleAlert as AlertCircle,
  BookOpen,
  Clock,
  Grid3X3,
  RotateCcw,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
  explanation: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeSpent: number;
  reattemptAnswer?: number; // New answer given during reattempt mode
}

export default function SolutionsScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [reattemptMode, setReattemptMode] = useState(false);
  const [reattemptAnswers, setReattemptAnswers] = useState<{ [key: number]: number }>({});
  const [hasReattempted, setHasReattempted] = useState<{ [key: number]: boolean }>({});

  const questions: Question[] = [
    {
      id: 1,
      question: 'What is the capital of India?',
      options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'],
      correctAnswer: 1,
      userAnswer: 1,
      explanation:
        'New Delhi is the capital of India and serves as the seat of the Government of India. It was officially declared as the capital in 1911, replacing Calcutta (now Kolkata). The city houses important government buildings including the Parliament House, Rashtrapati Bhavan, and various ministries.',
      subject: 'General Knowledge',
      difficulty: 'Easy',
      timeSpent: 45,
    },
    {
      id: 2,
      question:
        'Which of the following is the largest planet in our solar system?',
      options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 2,
      userAnswer: 3,
      explanation:
        "Jupiter is the largest planet in our solar system, with a mass greater than all other planets combined. It's a gas giant with a diameter of about 142,984 km, which is more than 11 times the diameter of Earth. Jupiter has a strong magnetic field and at least 79 known moons, including the four largest called the Galilean moons.",
      subject: 'Science',
      difficulty: 'Medium',
      timeSpent: 67,
    },
    {
      id: 3,
      question: 'What is 15% of 200?',
      options: ['25', '30', '35', '40'],
      correctAnswer: 1,
      userAnswer: undefined,
      explanation:
        'To calculate 15% of 200:\n15% = 15/100 = 0.15\n15% of 200 = 0.15 × 200 = 30\n\nAlternatively, you can think of it as:\n15% of 200 = (15 × 200) ÷ 100 = 3000 ÷ 100 = 30',
      subject: 'Mathematics',
      difficulty: 'Easy',
      timeSpent: 0,
    },
    {
      id: 4,
      question: "Who wrote the book 'Pride and Prejudice'?",
      options: [
        'Charlotte Brontë',
        'Jane Austen',
        'Emily Dickinson',
        'Virginia Woolf',
      ],
      correctAnswer: 1,
      userAnswer: 0,
      explanation:
        'Pride and Prejudice was written by Jane Austen and published in 1813. It is one of the most famous works of English literature and follows the character development of Elizabeth Bennet, the dynamic protagonist. The novel deals with issues of manners, upbringing, morality, education, and marriage in the society of the landed gentry of early 19th-century England.',
      subject: 'English Literature',
      difficulty: 'Medium',
      timeSpent: 89,
    },
    {
      id: 5,
      question: "Which gas is most abundant in Earth's atmosphere?",
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
      correctAnswer: 2,
      userAnswer: 0,
      explanation:
        "Nitrogen makes up about 78% of Earth's atmosphere, making it the most abundant gas. Oxygen comprises about 21%, while argon makes up about 0.93%. Carbon dioxide, despite its importance for climate and life, makes up only about 0.04% of the atmosphere. The remaining gases include neon, helium, methane, krypton, and hydrogen in very small amounts.",
      subject: 'Science',
      difficulty: 'Medium',
      timeSpent: 52,
    },
  ];

  const toggleShowAnswer = (questionIndex: number) => {
    setShowAnswers((prev) => ({
      ...prev,
      [questionIndex]: !prev[questionIndex],
    }));
  };

  const toggleAllAnswers = () => {
    const newShowAllState = !showAllAnswers;
    setShowAllAnswers(newShowAllState);
    
    // Update individual question states
    const newShowAnswers: { [key: number]: boolean } = {};
    questions.forEach((_, index) => {
      newShowAnswers[index] = newShowAllState;
    });
    setShowAnswers(newShowAnswers);
  };

  const handleReattemptAnswer = (questionIndex: number, answerIndex: number) => {
    setReattemptAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
    setHasReattempted((prev) => ({
      ...prev,
      [questionIndex]: true,
    }));
  };

  const resetReattempt = (questionIndex: number) => {
    setReattemptAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[questionIndex];
      return newAnswers;
    });
    setHasReattempted((prev) => ({
      ...prev,
      [questionIndex]: false,
    }));
    setShowAnswers((prev) => ({
      ...prev,
      [questionIndex]: false,
    }));
  };

  const getAnswerStatus = (question: Question, questionIndex: number) => {
    // In reattempt mode, if user hasn't reattempted yet, don't show status
    if (reattemptMode && !hasReattempted[questionIndex]) {
      return 'hidden';
    }
    
    if (question.userAnswer === undefined) return 'unanswered';
    if (question.userAnswer === question.correctAnswer) return 'correct';
    return 'incorrect';
  };

  const getReattemptStatus = (questionIndex: number) => {
    const reattemptAnswer = reattemptAnswers[questionIndex];
    if (reattemptAnswer === undefined) return 'not_attempted';
    
    const correctAnswer = questions[questionIndex].correctAnswer;
    return reattemptAnswer === correctAnswer ? 'correct' : 'incorrect';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'incorrect':
        return <XCircle size={20} color={Colors.danger} />;
      case 'unanswered':
        return <AlertCircle size={20} color={Colors.warning} />;
      case 'hidden':
        return null;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return Colors.success;
      case 'incorrect':
        return Colors.danger;
      case 'unanswered':
        return Colors.warning;
      case 'hidden':
        return Colors.textSubtle;
      default:
        return Colors.textSubtle;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'correct':
        return 'Correct';
      case 'incorrect':
        return 'Incorrect';
      case 'unanswered':
        return 'Not Answered';
      case 'hidden':
        return 'Reattempt Mode';
      default:
        return '';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const currentQuestionData = questions[currentQuestion];
  const answerStatus = getAnswerStatus(currentQuestionData, currentQuestion);
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
              {
                backgroundColor: getStatusColor(
                  getAnswerStatus(questions[index], index)
                ),
              },
            ]}
            onPress={() => {
              setCurrentQuestion(index);
              setShowGrid(false);
            }}
          >
            <Text
              style={[
                styles.gridItemText,
                getAnswerStatus(questions[index], index) === 'unanswered' && {
                  color: Colors.textSubtle,
                },
              ]}
            >
              {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Solutions</Text>
          <Text style={styles.questionCounter}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
        </View>
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowGrid(true)}
          >
            <Grid3X3 size={16} color={Colors.textSubtle} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.reattemptToggle}>
            <RotateCcw size={16} color={Colors.textSubtle} />
            <Switch
              value={reattemptMode}
              onValueChange={setReattemptMode}
              trackColor={{ false: Colors.muted, true: Colors.primaryLight }}
              thumbColor={reattemptMode ? Colors.primary : Colors.textSubtle}
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.questionMeta}>
              <View style={styles.subjectBadge}>
                <BookOpen size={12} color={Colors.primary} />
                <Text style={styles.subjectText}>
                  {currentQuestionData.subject}
                </Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor:
                      currentQuestionData.difficulty === 'Easy'
                        ? Colors.badgeSuccessBg
                        : currentQuestionData.difficulty === 'Medium'
                        ? Colors.premiumBadge
                        : Colors.badgeDangerBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    {
                      color:
                        currentQuestionData.difficulty === 'Easy'
                          ? Colors.success
                          : currentQuestionData.difficulty === 'Medium'
                          ? Colors.premiumText
                          : Colors.danger,
                    },
                  ]}
                >
                  {currentQuestionData.difficulty}
                </Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              {getStatusIcon(answerStatus)}
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(answerStatus) },
                ]}
              >
                {getStatusText(answerStatus)}
              </Text>
            </View>
          </View>

          <Text style={styles.questionText}>
            {currentQuestionData.question}
          </Text>

          <View style={styles.timeContainer}>
            <Clock size={14} color={Colors.textSubtle} />
            <Text style={styles.timeText}>
              Time spent:{' '}
              {currentQuestionData.timeSpent > 0
                ? formatTime(currentQuestionData.timeSpent)
                : 'Not attempted'}
            </Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestionData.options.map((option, index) => {
            const isCorrect = index === currentQuestionData.correctAnswer;
            const isUserAnswer = index === currentQuestionData.userAnswer;
            const isReattemptAnswer = index === reattemptAnswers[currentQuestion];
            const showOriginalAnswers = !reattemptMode || hasReattempted[currentQuestion];

            // In reattempt mode, show reattempt answer styling if user has reattempted
            const showCorrectStyling = showOriginalAnswers && isCorrect;
            const showIncorrectStyling = showOriginalAnswers && isUserAnswer && !isCorrect;
            const showReattemptCorrect = reattemptMode && hasReattempted[currentQuestion] && isReattemptAnswer && isCorrect;
            const showReattemptIncorrect = reattemptMode && hasReattempted[currentQuestion] && isReattemptAnswer && !isCorrect;

            const optionComponent = reattemptMode && !hasReattempted[currentQuestion] ? (
              // Clickable option for reattempt
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  isReattemptAnswer && styles.selectedOption,
                ]}
                onPress={() => handleReattemptAnswer(currentQuestion, index)}
              >
                <View
                  style={[
                    styles.optionIndicator,
                    isReattemptAnswer && styles.selectedIndicator,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLetter,
                      isReattemptAnswer && styles.optionLetterActive,
                    ]}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.optionText,
                    isReattemptAnswer && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>

                {isReattemptAnswer && <CheckCircle size={20} color={Colors.primary} />}
              </TouchableOpacity>
            ) : (
              // Regular display mode or after reattempt
              <View
                key={index}
                style={[
                  styles.optionCard,
                  showCorrectStyling && styles.correctOption,
                  showIncorrectStyling && styles.incorrectOption,
                  showReattemptCorrect && styles.reattemptCorrectOption,
                  showReattemptIncorrect && styles.reattemptIncorrectOption,
                ]}
              >
                <View
                  style={[
                    styles.optionIndicator,
                    showCorrectStyling && styles.correctIndicator,
                    showIncorrectStyling && styles.incorrectIndicator,
                    showReattemptCorrect && styles.correctIndicator,
                    showReattemptIncorrect && styles.incorrectIndicator,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLetter,
                      (showCorrectStyling || showIncorrectStyling || showReattemptCorrect || showReattemptIncorrect) &&
                        styles.optionLetterActive,
                    ]}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.optionText,
                    showCorrectStyling && styles.correctOptionText,
                    showIncorrectStyling && styles.incorrectOptionText,
                    showReattemptCorrect && styles.correctOptionText,
                    showReattemptIncorrect && styles.incorrectOptionText,
                  ]}
                >
                  {option}
                </Text>

                {showCorrectStyling && <CheckCircle size={20} color={Colors.success} />}
                {showIncorrectStyling && <XCircle size={20} color={Colors.danger} />}
                {showReattemptCorrect && <CheckCircle size={20} color={Colors.success} />}
                {showReattemptIncorrect && <XCircle size={20} color={Colors.danger} />}
              </View>
            );

            return optionComponent;
          })}
        </View>

        {/* Reattempt Status */}
        {reattemptMode && hasReattempted[currentQuestion] && (
          <View style={styles.reattemptStatusCard}>
            <Text style={styles.reattemptStatusTitle}>Reattempt Result:</Text>
            <View style={styles.reattemptStatusRow}>
              {getReattemptStatus(currentQuestion) === 'correct' ? (
                <>
                  <CheckCircle size={20} color={Colors.success} />
                  <Text style={[styles.reattemptStatusText, { color: Colors.success }]}>
                    Correct! Well done.
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={20} color={Colors.danger} />
                  <Text style={[styles.reattemptStatusText, { color: Colors.danger }]}>
                    Incorrect. The correct answer is shown above.
                  </Text>
                </>
              )}
            </View>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => resetReattempt(currentQuestion)}
            >
              <RotateCcw size={16} color={Colors.primary} />
              <Text style={styles.resetButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Show Answer Button */}
        {/* Only show explanation button if not in reattempt mode, or if user has reattempted */}
        {(!reattemptMode || hasReattempted[currentQuestion]) && (
          <TouchableOpacity
            style={styles.showAnswerButton}
            onPress={() => toggleShowAnswer(currentQuestion)}
          >
            {showAnswers[currentQuestion] ? (
              <EyeOff size={20} color={Colors.primary} />
            ) : (
              <Eye size={20} color={Colors.primary} />
            )}
            <Text style={styles.showAnswerText}>
              {showAnswers[currentQuestion]
                ? 'Hide Explanation'
                : 'Show Explanation'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Reattempt Instructions */}
        {reattemptMode && !hasReattempted[currentQuestion] && (
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>Reattempt Mode</Text>
            <Text style={styles.instructionText}>
              Select an answer above to see if you got it right. The explanation will be shown after you make your choice.
            </Text>
          </View>
        )}

        {/* Explanation */}
        {showAnswers[currentQuestion] && (!reattemptMode || hasReattempted[currentQuestion]) && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Explanation</Text>
            <Text style={styles.explanationText}>
              {currentQuestionData.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationFooter}>
        <TouchableOpacity
          style={[
            styles.navFooterButton,
            currentQuestion === 0 && styles.navFooterButtonDisabled,
          ]}
          onPress={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft
            size={20}
            color={currentQuestion === 0 ? Colors.gray400 : Colors.textPrimary}
          />
          <Text
            style={[
              styles.navFooterButtonText,
              currentQuestion === 0 && styles.navFooterButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navFooterButton,
            currentQuestion === questions.length - 1 &&
              styles.navFooterButtonDisabled,
          ]}
          onPress={() =>
            setCurrentQuestion((prev) =>
              Math.min(questions.length - 1, prev + 1)
            )
          }
          disabled={currentQuestion === questions.length - 1}
        >
          <Text
            style={[
              styles.navFooterButtonText,
              currentQuestion === questions.length - 1 &&
                styles.navFooterButtonTextDisabled,
            ]}
          >
            Next
          </Text>
          <ChevronRight
            size={20}
            color={
              currentQuestion === questions.length - 1 ? Colors.gray400 : Colors.textPrimary
            }
          />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light,
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
  questionCounter: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  reattemptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: Colors.cardBackground,
  },
  activeNavButton: {
    backgroundColor: Colors.primary,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeNavButtonText: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flex: 1,
    padding: 20,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  gridClose: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4,
  },
  gridItem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    margin: 4,
  },
  gridItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  questionCard: {
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
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.chip,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 26,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSubtle,
    marginLeft: 4,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
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
  correctOption: {
    borderColor: Colors.success,
    backgroundColor: Colors.badgeSuccessBg,
  },
  incorrectOption: {
    borderColor: Colors.danger,
    backgroundColor: Colors.badgeDangerBg,
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
  correctIndicator: {
    backgroundColor: Colors.success,
  },
  incorrectIndicator: {
    backgroundColor: Colors.danger,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSubtle,
  },
  optionLetterActive: {
    color: Colors.white,
  },
  optionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  correctOptionText: {
    color: Colors.success,
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: Colors.danger,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.chip,
  },
  selectedIndicator: {
    backgroundColor: Colors.primary,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  reattemptCorrectOption: {
    borderColor: Colors.success,
    backgroundColor: Colors.badgeSuccessBg,
  },
  reattemptIncorrectOption: {
    borderColor: Colors.danger,
    backgroundColor: Colors.badgeDangerBg,
  },
  showAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  showAnswerText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 8,
  },
  explanationCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  reattemptStatusCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reattemptStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  reattemptStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reattemptStatusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 6,
  },
  instructionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  navigationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.muted,
  },
  navFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light,
  },
  navFooterButtonDisabled: {
    opacity: 0.5,
  },
  navFooterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  navFooterButtonTextDisabled: {
    color: Colors.gray400,
  },
});
