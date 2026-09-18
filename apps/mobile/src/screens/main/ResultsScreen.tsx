import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Button, Card } from '@edudeca/ui';
import { useAppStore } from '../../store/useAppStore';
import { MessageCircle, Instagram, Zap, Award } from 'lucide-react-native';

type ResultsScreenNavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'Results'
>;
type ResultsScreenRouteProp = RouteProp<DashboardStackParamList, 'Results'>;

interface ResultsScreenProps {
  navigation?: any;
  route?: any;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const rawTotal = route.params?.total || 10;
  const total = Math.max(1, rawTotal);
  const rawScore = route.params?.score ?? 0;
  const score = Math.min(total, Math.max(0, rawScore));
  const accuracy = Math.min(
    100,
    Math.max(
      0,
      route.params?.accuracy !== undefined
        ? route.params.accuracy
        : Math.round((score / total) * 100)
    )
  );
  const fallbackRdm =
    total <= 10
      ? Math.min(50, score * 5)
      : total <= 20
      ? Math.min(110, Math.round(score * 5.5))
      : Math.min(180, score * 6);

  const earnedRdm = route.params?.earnedRdm !== undefined ? route.params.earnedRdm : fallbackRdm;
  const leveledUp = route.params?.leveledUp || false;
  const newLevel = route.params?.newLevel;

  const passed = route.params?.passed !== undefined ? route.params.passed : accuracy >= 70;
  const strikes = route.params?.strikes ?? Math.max(0, total - score);
  const challengeLevel = route.params?.level ?? 1;

  const level = useAppStore((state) => state.level);
  const streak = useAppStore((state) => state.streak);

  const displayLevel = newLevel ?? level;

  let emoji = '💪';
  let title = 'Challenge Failed';
  let subText = `Hit strike limit or time expired (${strikes}/3 strikes). You can try again tomorrow!`;

  if (passed) {
    emoji = accuracy >= 90 ? '🏆' : '🎉';
    title = 'Challenge Passed!';
    if (challengeLevel === 1) {
      subText = '🎉 Level 1 Cleared! Level 2 unlocks tomorrow.';
    } else if (challengeLevel === 2) {
      subText = '🎉 Level 2 Cleared! Level 3 unlocks tomorrow.';
    } else if (challengeLevel === 3) {
      subText = '🏆 Free Zone Completed! Priority access to Level 4 unlocked.';
    } else {
      subText = `Level ${challengeLevel} cleared with only ${strikes} strike${strikes === 1 ? '' : 's'}!`;
    }
  }

  const handleShare = async (platform: 'WhatsApp' | 'Instagram') => {
    try {
      await Share.share({
        message: `I just scored ${score}/${total} with ${strikes} strike(s) in EduDeca Daily Challenge! ⚡ Join me in India's Whiz360 Challenge!`,
      });
    } catch (_err) {
      Alert.alert('Share', `Sharing to ${platform}...`);
    }
  };

  const handleContinue = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Results Hero */}
        <View style={styles.resultsHero}>
          <Text style={styles.resultsEmoji}>{emoji}</Text>
          <Text style={styles.resultsTitle}>{title}</Text>
          <Text style={styles.resultsSub}>{subText}</Text>
        </View>

        {/* Big Score Readout */}
        <View style={styles.scoreWrap}>
          <Text style={styles.scoreBig}>
            {score}
            <Text style={styles.scoreOf}>/{total}</Text>
          </Text>
        </View>

        {/* 4 Result Metric Chips */}
        <View style={styles.resultsStatsRow}>
          <View style={styles.rstat}>
            <Text style={[styles.rstatVal, { color: colors.teal }]}>+{earnedRdm}</Text>
            <Text style={styles.rstatLbl}>XP Earned</Text>
          </View>
          <View style={styles.rstat}>
            <Text style={[styles.rstatVal, { color: strikes >= 3 ? colors.red : colors.gold }]}>
              {strikes}/3
            </Text>
            <Text style={styles.rstatLbl}>Strikes</Text>
          </View>
          <View style={styles.rstat}>
            <Text style={styles.rstatVal}>{accuracy}%</Text>
            <Text style={styles.rstatLbl}>Accuracy</Text>
          </View>
          <View style={styles.rstat}>
            <Text style={styles.rstatVal}>{Math.max(1, streak)}d</Text>
            <Text style={styles.rstatLbl}>Streak</Text>
          </View>
        </View>

        {/* Level Progression Banner if passed */}
        {passed && (
          <Card style={styles.leveledUpCard}>
            <View style={styles.leveledUpRow}>
              <Award size={22} color={colors.gold} strokeWidth={2.4} />
              <View style={{ flex: 1 }}>
                <Text style={styles.leveledUpTitle}>
                  {challengeLevel >= 3 ? 'Free Zone Conquered!' : 'Daily Challenge Mastered!'}
                </Text>
                <Text style={styles.leveledUpDesc}>
                  {challengeLevel >= 3
                    ? 'You finished all free rounds! Level 4 priority-access reservation has been granted.'
                    : `Level ${challengeLevel + 1} unlocks tomorrow. Maintain your daily streak to reach National Finals!`}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Share Buttons */}
        <View style={styles.shareRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.shareBtn}
            onPress={() => handleShare('WhatsApp')}
          >
            <MessageCircle size={16} color={colors.teal} />
            <Text style={styles.shareBtnText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.shareBtn}
            onPress={() => handleShare('Instagram')}
          >
            <Instagram size={16} color={colors.pink} />
            <Text style={styles.shareBtnText}>Instagram</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <Button
          title="Continue to Dashboard →"
          onPress={handleContinue}
          variant="primary"
          style={styles.continueBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
  },
  resultsHero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 21,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginBottom: 4,
  },
  resultsSub: {
    fontSize: 12.5,
    color: colors.muted,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scoreBig: {
    fontSize: typography.fontSize.score,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  scoreOf: {
    fontSize: 18,
    color: colors.mutedDim,
    fontWeight: typography.fontWeight.semibold,
  },
  resultsStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  rstat: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  rstatVal: {
    fontSize: 16,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
  },
  rstatLbl: {
    fontSize: 9,
    color: colors.mutedDim,
    textTransform: 'uppercase',
    marginTop: 2,
    fontWeight: typography.fontWeight.bold,
  },
  leveledUpCard: {
    padding: 14,
    backgroundColor: colors.goldAlpha10,
    borderColor: colors.goldAlpha35,
    marginBottom: 16,
  },
  leveledUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leveledUpTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gold,
    marginBottom: 2,
  },
  leveledUpDesc: {
    fontSize: 11.5,
    color: colors.text,
    lineHeight: 16,
  },
  shareRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  continueBtn: {
    marginTop: 4,
  },
});
