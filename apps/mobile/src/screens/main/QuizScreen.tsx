import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Button, Card } from '@edudeca/ui';
import { ArrowLeft, Lock, Award, ShieldAlert, CheckCircle2 } from 'lucide-react-native';
import { Question } from '@edudeca/types';
import { useAppStore } from '../../store/useAppStore';
import { quizService } from '../../services';

type QuizScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Quiz'>;
type QuizScreenRouteProp = RouteProp<DashboardStackParamList, 'Quiz'>;

interface QuizScreenProps {
  navigation?: any;
  route?: any;
}

const STRIKE_LIMIT = 3;

// Whole-level timer durations: Level 1 (180s = 3m), Level 2 (150s = 2.5m), Level 3 (120s = 2m)
const LEVEL_DURATIONS: Record<number, number> = {
  1: 180,
  2: 150,
  3: 120,
};

export const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
  const roundLength = route.params?.quizLength || 10;
  const user = useAppStore((state) => state.user);
  const currentLevel = useAppStore((state) => state.level);
  const targetLevel = route.params?.level || Math.max(1, currentLevel || 1);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const addRdm = useAppStore((state) => state.addRdm);
  const incrementQuizzesCompleted = useAppStore((state) => state.incrementQuizzesCompleted);
  const incrementStreak = useAppStore((state) => state.incrementStreak);
  const incrementLevel = useAppStore((state) => state.incrementLevel);

  // Free zone is Levels 1-3. Level 4+ is proctored gate.
  const isPriorityGate = targetLevel >= 4;

  const totalDuration = LEVEL_DURATIONS[targetLevel] || 180;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(totalDuration);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(!isPriorityGate);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const finishedRef = useRef<boolean>(false);

  const loadQuestions = async () => {
    if (isPriorityGate) {
      setIsLoadingQuestions(false);
      return;
    }

    setIsLoadingQuestions(true);
    setLoadError(null);
    try {
      const serverQuestions = await quizService.fetchChallengeQuestions(targetLevel);
      if (serverQuestions && serverQuestions.length > 0) {
        setQuestions(serverQuestions.slice(0, roundLength));
      } else {
        setLoadError('No questions available for this level from live API. Please try again later.');
      }
    } catch (err: any) {
      console.log('[QuizScreen] Live question fetch notice:', err.message);
      setLoadError(err.message || 'Failed to load live challenge questions. Please check connection.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Fetch questions from the EduDeca website API on mount
  useEffect(() => {
    startTimeRef.current = Date.now();
    finishedRef.current = false;
    loadQuestions();
    setCurrentIndex(0);
    setScore(0);
    setStrikes(0);
    setTimeLeft(totalDuration);
  }, [roundLength, targetLevel]);

  // Whole-Level Countdown Timer (runs continuously for the entire level)
  useEffect(() => {
    if (questions.length === 0 || isPriorityGate || isSubmitting || isFinished) {
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions.length, isSubmitting, isFinished, isPriorityGate]);

  const handleTimeOut = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setIsFinished(true);

    // Unanswered questions count as strikes
    const answeredCount = currentIndex + (pickedIndex !== null ? 1 : 0);
    const unanswered = Math.max(0, questions.length - answeredCount);
    const finalStrikes = strikes + unanswered;

    Alert.alert(
      '⏰ Time Expired!',
      `Whole-level timer ran out. Unanswered cards count as strikes. Challenge Failed.`,
      [{ text: 'View Results', onPress: () => finishQuiz({ passed: false, finalStrikes, reason: 'timeout' }) }]
    );
  };

  const handlePickOption = (index: number) => {
    if (pickedIndex !== null || isFinished) return;

    setPickedIndex(index);
    const currentQ = questions[currentIndex];
    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);

      if (newStrikes >= STRIKE_LIMIT) {
        if (timerRef.current) clearInterval(timerRef.current);
        finishedRef.current = true;
        setIsFinished(true);

        Alert.alert(
          '❌ Strike Limit Reached',
          `You received ${newStrikes} strikes. Challenge Failed for today.`,
          [{ text: 'View Results', onPress: () => finishQuiz({ passed: false, finalStrikes: newStrikes, reason: 'strikes' }) }]
        );
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setPickedIndex(null);
    } else {
      // Finished all cards!
      const isPassed = strikes < STRIKE_LIMIT;
      finishQuiz({ passed: isPassed, finalStrikes: strikes });
    }
  };

  const finishQuiz = async (opts: { passed: boolean; finalStrikes: number; reason?: string }) => {
    if (timerRef.current) clearInterval(timerRef.current);
    finishedRef.current = true;
    setIsFinished(true);

    const total = Math.max(1, questions.length);
    const finalScore = Math.min(total, Math.max(0, score));
    const accuracy = Math.min(100, Math.max(0, Math.round((finalScore / total) * 100)));
    const timeTaken = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const { passed, finalStrikes } = opts;

    let earnedRdm = 0;
    if (passed) {
      if (total <= 10) earnedRdm = Math.min(50, finalScore * 5);
      else if (total <= 20) earnedRdm = Math.min(110, Math.round(finalScore * 5.5));
      else earnedRdm = Math.min(180, finalScore * 6);
    }

    setIsSubmitting(true);

    try {
      // Live API backend submission (POST /api/challenge/complete)
      const response = await quizService.submitQuizAttempt({
        userId: user?.id,
        level: targetLevel,
        score: finalScore,
        total,
        totalQuestions: total,
        strikes: finalStrikes,
        accuracy,
        timeTaken,
        earnedRdm,
        passed,
      });

      if (response?.user) {
        setUserProfile(response.user);
      } else {
        if (passed) {
          addRdm(earnedRdm);
          incrementQuizzesCompleted();
          incrementStreak();
          if (targetLevel >= currentLevel) {
            incrementLevel();
          }
        }
      }

      navigation.navigate('Results', {
        score: finalScore,
        total,
        earnedRdm: response?.attempt?.earnedRdm ?? earnedRdm,
        accuracy: response?.attempt?.accuracy ?? accuracy,
        leveledUp: response?.leveledUp ?? (passed && targetLevel >= currentLevel),
        newLevel: response?.newLevel ?? (passed ? Math.max(currentLevel, targetLevel + 1) : currentLevel),
        passed,
        strikes: finalStrikes,
        level: targetLevel,
      });
    } catch (err: any) {
      console.log('[QuizScreen] Submit notice:', err.message);
      if (passed) {
        addRdm(earnedRdm);
        incrementQuizzesCompleted();
        incrementStreak();
        if (targetLevel >= currentLevel) {
          incrementLevel();
        }
      }

      navigation.navigate('Results', {
        score: finalScore,
        total,
        earnedRdm,
        accuracy,
        leveledUp: passed && targetLevel >= currentLevel,
        newLevel: passed ? Math.max(currentLevel, targetLevel + 1) : currentLevel,
        passed,
        strikes: finalStrikes,
        level: targetLevel,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExit = () => {
    Alert.alert('Leave this challenge?', "Your progress won't be saved and this will count as an incomplete attempt.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          if (timerRef.current) clearInterval(timerRef.current);
          navigation.navigate('Dashboard');
        },
      },
    ]);
  };

  // Format whole-level seconds into MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Priority-Access Gate for Level 4+
  if (isPriorityGate) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.gateContainer}>
          <TouchableOpacity activeOpacity={0.7} style={styles.backBtnTop} onPress={() => navigation.navigate('Dashboard')}>
            <ArrowLeft size={16} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.gateCard}>
            <View style={styles.gateIconWrap}>
              <Lock size={36} color={colors.gold} strokeWidth={2.4} />
            </View>

            <Text style={styles.gateBadge}>LEVEL 4 · PRIORITY ACCESS GATE</Text>
            <Text style={styles.gateTitle}>Free Zone Completed!</Text>
            <Text style={styles.gateSub}>
              You have cleared Levels 1, 2, and 3. Level 4 is the proctored stage conducted with partner colleges.
            </Text>

            <View style={styles.gateHighlightBox}>
              <Award size={20} color={colors.teal} />
              <Text style={styles.gateHighlightText}>
                Your priority-access slot is reserved. Questions for Level 4 will be administered during scheduled proctored sessions.
              </Text>
            </View>

            <Button
              title="Back to Dashboard"
              onPress={() => navigation.navigate('Dashboard')}
              variant="primary"
              style={{ width: '100%', marginTop: 24 }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError && questions.length === 0 && !isLoadingQuestions) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ShieldAlert size={44} color={colors.amber} style={{ marginBottom: 12 }} />
          <Text style={{ color: colors.amber, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            Challenge Unavailable
          </Text>
          <Text style={{ color: colors.muted, textAlign: 'center', marginHorizontal: 24, marginBottom: 20, lineHeight: 20 }}>
            {loadError}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.teal, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10, marginBottom: 12 }}
            onPress={loadQuestions}
          >
            <Text style={{ color: '#000', fontWeight: 'bold' }}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingHorizontal: 20, paddingVertical: 10 }}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={{ color: colors.muted }}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0 || isSubmitting || isLoadingQuestions) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} style={{ marginBottom: 12 }} />
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            {isSubmitting ? 'Submitting challenge to server...' : 'Loading challenge questions...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const progressPct = ((currentIndex + 1) / total) * 100;
  const optionLetters = ['A', 'B', 'C', 'D'];
  const tagColor = (colors as any)[currentQ?.color] || colors.teal;

  const questionPrompt =
    (typeof currentQ?.q === 'string' && currentQ.q.trim()) ||
    (typeof (currentQ as any)?.question === 'string' && (currentQ as any).question.trim()) ||
    (typeof (currentQ as any)?.question_text === 'string' && (currentQ as any).question_text.trim()) ||
    (typeof (currentQ as any)?.questionText === 'string' && (currentQ as any).questionText.trim()) ||
    (typeof (currentQ as any)?.prompt === 'string' && (currentQ as any).prompt.trim()) ||
    (typeof (currentQ as any)?.text === 'string' && (currentQ as any).text.trim()) ||
    (typeof (currentQ as any)?.title === 'string' && (currentQ as any).title.trim()) ||
    (typeof (currentQ as any)?.statement === 'string' && (currentQ as any).statement.trim()) ||
    '';

  useEffect(() => {
    if (questions.length > 0 && currentQ) {
      console.log(`[QuizScreen] Card ${currentIndex + 1}/${questions.length}:`, {
        prompt: questionPrompt,
        tag: currentQ.tag,
        options: currentQ.options,
      });
    }
  }, [currentIndex, questions.length, questionPrompt]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quiz Header: Back + Progress + Whole-Level Timer + Strikes HUD */}
        <View style={styles.quizHead}>
          <TouchableOpacity activeOpacity={0.7} style={styles.backBtn} onPress={handleExit}>
            <ArrowLeft size={16} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.progressWrap}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressPos}>
                Card {currentIndex + 1} of {total} · Lv {targetLevel}
              </Text>
              <Text style={styles.progressScore}>Score: {score}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
            </View>
          </View>

          {/* Whole-Level Timer Display */}
          <View
            style={[
              styles.timerRing,
              timeLeft <= 30 && styles.timerUrgent,
              timeLeft === 0 && styles.timerDead,
            ]}
          >
            <Text
              style={[
                styles.timerText,
                timeLeft <= 30 && styles.timerTextUrgent,
                timeLeft === 0 && styles.timerTextDead,
              ]}
            >
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        {/* HUD Subbar: Strikes Indicator & Level Info */}
        <View style={styles.hudSubbar}>
          <View style={styles.strikesContainer}>
            <Text style={styles.strikesLabel}>Strikes:</Text>
            {[...Array(STRIKE_LIMIT)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.strikeBadge,
                  i < strikes ? styles.strikeBadgeActive : styles.strikeBadgeEmpty,
                ]}
              >
                <Text
                  style={[
                    styles.strikeBadgeText,
                    i < strikes ? styles.strikeBadgeTextActive : styles.strikeBadgeTextEmpty,
                  ]}
                >
                  {i < strikes ? '✕' : '○'}
                </Text>
              </View>
            ))}
            <Text style={styles.strikesCountText}>
              ({strikes}/{STRIKE_LIMIT} max)
            </Text>
          </View>

          <View style={styles.levelTagChip}>
            <Text style={styles.levelTagText}>Level {targetLevel} Challenge</Text>
          </View>
        </View>

        {/* Discipline Tag Chip */}
        <View style={styles.tagWrap}>
          <View style={[styles.tagBadge, { borderColor: tagColor }]}>
            <View style={[styles.tagDot, { backgroundColor: tagColor }]} />
            <Text style={[styles.tagLabel, { color: tagColor }]}>{currentQ?.tag || 'DISCIPLINE'}</Text>
          </View>
        </View>

        {/* Question Text Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {questionPrompt || 'Question text unavailable'}
          </Text>
        </View>

        {/* 4 Option Buttons */}
        <View style={styles.optionsWrap}>
          {currentQ?.options?.map((optRaw, index) => {
            const optText =
              typeof optRaw === 'string'
                ? optRaw
                : (optRaw as any)?.text || (optRaw as any)?.option || (optRaw as any)?.value || String(optRaw);
            const isPicked = pickedIndex === index;
            const isCorrect = index === currentQ.correctIndex;
            const isAnswered = pickedIndex !== null;

            let optStyle: ViewStyle = styles.optNormal;
            let textStyle: TextStyle = styles.optTextNormal;
            let letterStyle: ViewStyle = styles.optLetterNormal;
            let letterTextStyle: TextStyle = styles.optLetterTextNormal;

            if (isAnswered) {
              if (isCorrect) {
                optStyle = styles.optCorrect;
                textStyle = styles.optTextCorrect;
                letterStyle = styles.optLetterCorrect;
                letterTextStyle = styles.optLetterTextCorrect;
              } else if (isPicked) {
                optStyle = styles.optIncorrect;
                textStyle = styles.optTextIncorrect;
                letterStyle = styles.optLetterIncorrect;
                letterTextStyle = styles.optLetterTextIncorrect;
              } else {
                optStyle = styles.optDimmed;
                textStyle = styles.optTextDimmed;
              }
            }

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={[styles.optBtn, optStyle]}
                onPress={() => handlePickOption(index)}
                disabled={isAnswered || isFinished}
              >
                <View style={[styles.optLetter, letterStyle]}>
                  <Text style={[styles.optLetterText, letterTextStyle]}>
                    {optionLetters[index]}
                  </Text>
                </View>
                <Text style={[styles.optText, textStyle]}>{optText}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next Card / Finish Button */}
        {pickedIndex !== null && !isFinished && (
          <Button
            title={currentIndex < questions.length - 1 ? 'Next Card →' : 'Complete Challenge →'}
            onPress={handleNext}
            variant="primary"
            style={styles.nextBtn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },
  quizHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    flex: 1,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressPos: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
  },
  progressScore: {
    fontSize: 11,
    color: colors.teal,
    fontWeight: typography.fontWeight.extrabold,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 3,
  },
  timerRing: {
    minWidth: 54,
    height: 34,
    paddingHorizontal: 8,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.teal,
    backgroundColor: 'rgba(34,211,166,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerUrgent: {
    borderColor: colors.red,
    backgroundColor: 'rgba(240,101,79,0.15)',
  },
  timerDead: {
    borderColor: colors.mutedDim,
    backgroundColor: colors.card2,
  },
  timerText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
  },
  timerTextUrgent: {
    color: colors.red,
  },
  timerTextDead: {
    color: colors.mutedDim,
  },
  hudSubbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  strikesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  strikesLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
    marginRight: 2,
  },
  strikeBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strikeBadgeActive: {
    backgroundColor: 'rgba(240,101,79,0.2)',
    borderWidth: 1,
    borderColor: colors.red,
  },
  strikeBadgeEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  strikeBadgeText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
  },
  strikeBadgeTextActive: {
    color: colors.red,
  },
  strikeBadgeTextEmpty: {
    color: colors.mutedDim,
  },
  strikesCountText: {
    fontSize: 10.5,
    color: colors.mutedDim,
    marginLeft: 4,
  },
  levelTagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(240,180,41,0.1)',
  },
  levelTagText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gold,
  },
  tagWrap: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagLabel: {
    fontSize: 10.5,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    marginBottom: 16,
    minHeight: 80,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    lineHeight: 24,
  },
  optionsWrap: {
    gap: 10,
    marginBottom: 20,
  },
  optBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    gap: 12,
  },
  optNormal: {
    backgroundColor: colors.card2,
    borderColor: colors.border,
  },
  optCorrect: {
    backgroundColor: 'rgba(34,211,166,0.12)',
    borderColor: colors.teal,
  },
  optIncorrect: {
    backgroundColor: 'rgba(240,101,79,0.12)',
    borderColor: colors.red,
  },
  optDimmed: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    opacity: 0.4,
  },
  optLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optLetterNormal: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  optLetterCorrect: {
    backgroundColor: colors.teal,
  },
  optLetterIncorrect: {
    backgroundColor: colors.red,
  },
  optLetterText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
  },
  optLetterTextNormal: {
    color: colors.muted,
  },
  optLetterTextCorrect: {
    color: '#062017',
  },
  optLetterTextIncorrect: {
    color: '#fff',
  },
  optText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  optTextNormal: {
    color: colors.text,
  },
  optTextCorrect: {
    color: colors.teal,
    fontWeight: typography.fontWeight.bold,
  },
  optTextIncorrect: {
    color: colors.red,
  },
  optTextDimmed: {
    color: colors.mutedDim,
  },
  nextBtn: {
    marginBottom: 20,
  },
  gateContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backBtnTop: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(240,180,41,0.35)',
    padding: 24,
    alignItems: 'center',
  },
  gateIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(240,180,41,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gateBadge: {
    fontSize: 10,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gold,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  gateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  gateSub: {
    fontSize: typography.fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  gateHighlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gateHighlightText: {
    flex: 1,
    fontSize: 12,
    color: colors.teal,
    lineHeight: 18,
  },
});