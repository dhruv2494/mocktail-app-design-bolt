import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Flag, ChevronLeft, ChevronRight, Grid3x3 as Grid3X3, Pause, Play, Globe, BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import { getTheme } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/shared';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit?: number;
}

export default function QuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isPaused, setIsPaused] = useState(false);
  const [canPause, setCanPause] = useState(true); // Some tests allow pause, others don't
  const { isDarkMode } = useTheme();
  const Colors = getTheme(isDarkMode);
  const { t } = useLanguage();
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [showGrid, setShowGrid] = useState(false);
  
  const availableLanguages = ['English', 'Hindi', 'Kannada', 'Telugu'];
  
  const testInfo = {
    title: 'PSI Mock Test 1',
    canPause: true, // Some tests like final exams don't allow pause
    isOneTime: false, // One-time completion tests
    multiLanguage: true
  };

  const questions: Question[] = [
    {
      id: 1,
      question: "What is the capital of India?",
      options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
      correctAnswer: 1,
      explanation: "New Delhi is the capital of India and serves as the seat of the Government of India.",
      subject: "General Knowledge",
      difficulty: "Easy"
    },
    {
      id: 2,
      question: "Which of the following is the largest planet in our solar system?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 2,
      explanation: "Jupiter is the largest planet in our solar system, with a mass greater than all other planets combined.",
      subject: "Science",
      difficulty: "Medium"
    },
    {
      id: 3,
      question: "What is 15% of 200?",
      options: ["25", "30", "35", "40"],
      correctAnswer: 1,
      explanation: "15% of 200 = (15/100) × 200 = 30",
      subject: "Mathematics",
      difficulty: "Easy"
    },
    {
      id: 4,
      question: "Who wrote the book 'Pride and Prejudice'?",
      options: ["Charlotte Brontë", "Jane Austen", "Emily Dickinson", "Virginia Woolf"],
      correctAnswer: 1,
      explanation: "Pride and Prejudice was written by Jane Austen and published in 1813.",
      subject: "English Literature",
      difficulty: "Medium"
    },
    {
      id: 5,
      question: "Which gas is most abundant in Earth's atmosphere?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      correctAnswer: 2,
      explanation: "Nitrogen makes up about 78% of Earth's atmosphere, making it the most abundant gas.",
      subject: "Science",
      difficulty: "Medium"
    }
  ];

  const languages = ['English', 'Hindi', 'Marathi', 'Gujarati'];

  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
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
  }, [isPaused, timeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));
  };

  const handleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleSubmitTest = () => {
    router.push('/test/results');
  };

  const getQuestionStatus = (index: number) => {
    if (selectedAnswers[index] !== undefined) return 'answered';
    if (flaggedQuestions.has(index)) return 'flagged';
    if (index === currentQuestion) return 'current';
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
            <Text style={styles.testTitle}>PSI Mock Test 1</Text>
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
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => setShowGrid(true)}
          >
            <Grid3X3 size={16} color={Colors.textSubtle} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton,
              flaggedQuestions.has(currentQuestion) && styles.flaggedButton
            ]}
            onPress={handleFlagQuestion}
          >
            <Flag 
              size={16} 
              color={flaggedQuestions.has(currentQuestion) ? Colors.warning : Colors.textSubtle} 
              fill={flaggedQuestions.has(currentQuestion) ? Colors.warning : 'none'}
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
              { backgroundColor: questions[currentQuestion].difficulty === 'Easy' ? Colors.badgeSuccessBg : 
                                 questions[currentQuestion].difficulty === 'Medium' ? Colors.premiumBadge : Colors.badgeDangerBg }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: questions[currentQuestion].difficulty === 'Easy' ? Colors.success : 
                         questions[currentQuestion].difficulty === 'Medium' ? Colors.premiumText : Colors.danger }
              ]}>
                {questions[currentQuestion].difficulty}
              </Text>
            </View>
          </View>
          
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {questions[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[currentQuestion] === index && styles.selectedOption
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <View style={[
                styles.optionIndicator,
                selectedAnswers[currentQuestion] === index && styles.selectedIndicator
              ]}>
                <Text style={[
                  styles.optionLetter,
                  selectedAnswers[currentQuestion] === index && styles.selectedOptionLetter
                ]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                selectedAnswers[currentQuestion] === index && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
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
          >
            <LinearGradient
              colors={[Colors.danger, Colors.danger]}
              style={styles.submitGradient}
            >
              <Text style={styles.submitButtonText}>Submit Test</Text>
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
});