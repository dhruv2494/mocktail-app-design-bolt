import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Eye, EyeOff, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, BookOpen, Clock } from 'lucide-react-native';
import { router } from 'expo-router';

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
}

export default function SolutionsScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({});

  const questions: Question[] = [
    {
      id: 1,
      question: "What is the capital of India?",
      options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
      correctAnswer: 1,
      userAnswer: 1,
      explanation: "New Delhi is the capital of India and serves as the seat of the Government of India. It was officially declared as the capital in 1911, replacing Calcutta (now Kolkata). The city houses important government buildings including the Parliament House, Rashtrapati Bhavan, and various ministries.",
      subject: "General Knowledge",
      difficulty: "Easy",
      timeSpent: 45
    },
    {
      id: 2,
      question: "Which of the following is the largest planet in our solar system?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 2,
      userAnswer: 3,
      explanation: "Jupiter is the largest planet in our solar system, with a mass greater than all other planets combined. It's a gas giant with a diameter of about 142,984 km, which is more than 11 times the diameter of Earth. Jupiter has a strong magnetic field and at least 79 known moons, including the four largest called the Galilean moons.",
      subject: "Science",
      difficulty: "Medium",
      timeSpent: 67
    },
    {
      id: 3,
      question: "What is 15% of 200?",
      options: ["25", "30", "35", "40"],
      correctAnswer: 1,
      userAnswer: undefined,
      explanation: "To calculate 15% of 200:\n15% = 15/100 = 0.15\n15% of 200 = 0.15 × 200 = 30\n\nAlternatively, you can think of it as:\n15% of 200 = (15 × 200) ÷ 100 = 3000 ÷ 100 = 30",
      subject: "Mathematics",
      difficulty: "Easy",
      timeSpent: 0
    },
    {
      id: 4,
      question: "Who wrote the book 'Pride and Prejudice'?",
      options: ["Charlotte Brontë", "Jane Austen", "Emily Dickinson", "Virginia Woolf"],
      correctAnswer: 1,
      userAnswer: 0,
      explanation: "Pride and Prejudice was written by Jane Austen and published in 1813. It is one of the most famous works of English literature and follows the character development of Elizabeth Bennet, the dynamic protagonist. The novel deals with issues of manners, upbringing, morality, education, and marriage in the society of the landed gentry of early 19th-century England.",
      subject: "English Literature",
      difficulty: "Medium",
      timeSpent: 89
    },
    {
      id: 5,
      question: "Which gas is most abundant in Earth's atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      correctAnswer: 2,
      userAnswer: 0,
      explanation: "Nitrogen makes up about 78% of Earth's atmosphere, making it the most abundant gas. Oxygen comprises about 21%, while argon makes up about 0.93%. Carbon dioxide, despite its importance for climate and life, makes up only about 0.04% of the atmosphere. The remaining gases include neon, helium, methane, krypton, and hydrogen in very small amounts.",
      subject: "Science",
      difficulty: "Medium",
      timeSpent: 52
    }
  ];

  const toggleShowAnswer = (questionIndex: number) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  const getAnswerStatus = (question: Question) => {
    if (question.userAnswer === undefined) return 'unanswered';
    if (question.userAnswer === question.correctAnswer) return 'correct';
    return 'incorrect';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle size={20} color="#10B981" />;
      case 'incorrect':
        return <XCircle size={20} color="#EF4444" />;
      case 'unanswered':
        return <AlertCircle size={20} color="#F59E0B" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return '#10B981';
      case 'incorrect': return '#EF4444';
      case 'unanswered': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'correct': return 'Correct';
      case 'incorrect': return 'Incorrect';
      case 'unanswered': return 'Not Answered';
      default: return '';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const currentQuestionData = questions[currentQuestion];
  const answerStatus = getAnswerStatus(currentQuestionData);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Solutions</Text>
          <Text style={styles.questionCounter}>
            Question {currentQuestion + 1} of {questions.length}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Question Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.navigationContainer}
      >
        {questions.map((_, index) => {
          const status = getAnswerStatus(questions[index]);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.navButton,
                { borderColor: getStatusColor(status) },
                index === currentQuestion && styles.activeNavButton
              ]}
              onPress={() => setCurrentQuestion(index)}
            >
              <Text style={[
                styles.navButtonText,
                { color: getStatusColor(status) },
                index === currentQuestion && styles.activeNavButtonText
              ]}>
                {index + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.questionMeta}>
              <View style={styles.subjectBadge}>
                <BookOpen size={12} color="#FF6B35" />
                <Text style={styles.subjectText}>{currentQuestionData.subject}</Text>
              </View>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: currentQuestionData.difficulty === 'Easy' ? '#D1FAE5' : 
                                 currentQuestionData.difficulty === 'Medium' ? '#FEF3C7' : '#FEE2E2' }
              ]}>
                <Text style={[
                  styles.difficultyText,
                  { color: currentQuestionData.difficulty === 'Easy' ? '#065F46' : 
                           currentQuestionData.difficulty === 'Medium' ? '#92400E' : '#991B1B' }
                ]}>
                  {currentQuestionData.difficulty}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusContainer}>
              {getStatusIcon(answerStatus)}
              <Text style={[styles.statusText, { color: getStatusColor(answerStatus) }]}>
                {getStatusText(answerStatus)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.questionText}>{currentQuestionData.question}</Text>
          
          <View style={styles.timeContainer}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.timeText}>
              Time spent: {currentQuestionData.timeSpent > 0 ? formatTime(currentQuestionData.timeSpent) : 'Not attempted'}
            </Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestionData.options.map((option, index) => {
            const isCorrect = index === currentQuestionData.correctAnswer;
            const isUserAnswer = index === currentQuestionData.userAnswer;
            
            return (
              <View
                key={index}
                style={[
                  styles.optionCard,
                  isCorrect && styles.correctOption,
                  isUserAnswer && !isCorrect && styles.incorrectOption
                ]}
              >
                <View style={[
                  styles.optionIndicator,
                  isCorrect && styles.correctIndicator,
                  isUserAnswer && !isCorrect && styles.incorrectIndicator
                ]}>
                  <Text style={[
                    styles.optionLetter,
                    (isCorrect || (isUserAnswer && !isCorrect)) && styles.optionLetterActive
                  ]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                
                <Text style={[
                  styles.optionText,
                  isCorrect && styles.correctOptionText,
                  isUserAnswer && !isCorrect && styles.incorrectOptionText
                ]}>
                  {option}
                </Text>
                
                {isCorrect && (
                  <CheckCircle size={20} color="#10B981" />
                )}
                {isUserAnswer && !isCorrect && (
                  <XCircle size={20} color="#EF4444" />
                )}
              </View>
            );
          })}
        </View>

        {/* Show Answer Button */}
        <TouchableOpacity
          style={styles.showAnswerButton}
          onPress={() => toggleShowAnswer(currentQuestion)}
        >
          {showAnswers[currentQuestion] ? (
            <EyeOff size={20} color="#FF6B35" />
          ) : (
            <Eye size={20} color="#FF6B35" />
          )}
          <Text style={styles.showAnswerText}>
            {showAnswers[currentQuestion] ? 'Hide Explanation' : 'Show Explanation'}
          </Text>
        </TouchableOpacity>

        {/* Explanation */}
        {showAnswers[currentQuestion] && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Explanation</Text>
            <Text style={styles.explanationText}>{currentQuestionData.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationFooter}>
        <TouchableOpacity
          style={[
            styles.navFooterButton,
            currentQuestion === 0 && styles.navFooterButtonDisabled
          ]}
          onPress={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft size={20} color={currentQuestion === 0 ? '#9CA3AF' : '#374151'} />
          <Text style={[
            styles.navFooterButtonText,
            currentQuestion === 0 && styles.navFooterButtonTextDisabled
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navFooterButton,
            currentQuestion === questions.length - 1 && styles.navFooterButtonDisabled
          ]}
          onPress={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
          disabled={currentQuestion === questions.length - 1}
        >
          <Text style={[
            styles.navFooterButtonText,
            currentQuestion === questions.length - 1 && styles.navFooterButtonTextDisabled
          ]}>
            Next
          </Text>
          <ChevronRight size={20} color={currentQuestion === questions.length - 1 ? '#9CA3AF' : '#374151'} />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    color: '#111827',
  },
  questionCounter: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  navigationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  activeNavButton: {
    backgroundColor: '#FF6B35',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeNavButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
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
    backgroundColor: '#FFF4ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  subjectText: {
    fontSize: 12,
    color: '#FF6B35',
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
    color: '#111827',
    lineHeight: 26,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  correctIndicator: {
    backgroundColor: '#10B981',
  },
  incorrectIndicator: {
    backgroundColor: '#EF4444',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionLetterActive: {
    color: '#FFFFFF',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
    lineHeight: 22,
  },
  correctOptionText: {
    color: '#065F46',
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: '#991B1B',
  },
  showAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  showAnswerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B35',
    marginLeft: 8,
  },
  explanationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  navigationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navFooterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  navFooterButtonDisabled: {
    opacity: 0.5,
  },
  navFooterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  navFooterButtonTextDisabled: {
    color: '#9CA3AF',
  },
});