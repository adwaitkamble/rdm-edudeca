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
  const isPassed = accuracy >= 70;
  const fallbackRdm =
    total <= 10
      ? Math.min(50, Math.round(score * 3 + (isPassed ? 20 : 0)))
      : total <= 20
      ? Math.min(110, Math.round(score * 4 + (isPassed ? 30 : 0)))
      : Math.min(180, Math.round(score * 5 + (isPassed ? 30 : 0)));

  const earnedRdm = route.params?.earnedRdm !== undefined ? route.params.earnedRdm : fallbackRdm;
  const leveledUp = route.params?.leveledUp || false;
  const newLevel = route.params?.newLevel;

  const level = useAppStore((state) => state.level);
  const streak = useAppStore((state) => state.streak);

  const displayLevel = newLevel ?? level;

  const emoji = accuracy >= 80 ? '🏆' : accuracy >= 70 ? '🎉' : '💪';
  const title =
    accuracy >= 80
      ? 'Outstanding round!'
      : accuracy >= 70
      ? 'Round Passed!'
      : 'Keep practicing!';

  const subText = leveledUp
    ? `🎉 You unlocked Level ${displayLevel}!`
    : accuracy >= 70
    ? `Great job! You mastered Level ${displayLevel}`
    : `Score 70% or higher to advance to Level ${displayLevel + 1}`;

  const handleShare = async (platform: 'WhatsApp' | 'Instagram') => {
    try {
      await Share.share({
        message: `I just scored ${score}/${total} (${accuracy}% accuracy) in EduDeca and earned +${earnedRdm} RDM points! ⚡ Join me in India's Whiz360 Challenge!`,
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

        {/* 3 Result Metric Chips */}
        <View style={styles.resultsStatsRow}>
          <View style={styles.rstat}>
            <Text style={styles.rstatVal}>+{earnedRdm}</Text>
            <Text style={styles.rstatLbl}>RDM Earned</Text>
          </View>
          <View style={styles.rstat}>
            <Text style={styles.rstatVal}>{accuracy}%</Text>
            <Text style={styles.rstatLbl}>Accuracy</Text>
          </View>
          <View style={styles.rstat}>
            <Text style={styles.rstatVal}>{Math.max(1, streak)}</Text>
            <Text style={styles.rstatLbl}>Day Streak</Text>
          </View>
        </View>

        {/* Level Progression Banner if leveled up */}
        {leveledUp && (
          <Card style={styles.leveledUpCard}>
            <View style={styles.leveledUpRow}>
              <Award size={22} color={colors.gold} strokeWidth={2.4} />
              <View style={{ flex: 1 }}>
                <Text style={styles.leveledUpTitle}>New Level Unlocked!</Text>
                <Text style={styles.leveledUpDesc}>
                  You advanced to Level {displayLevel}. Keep competing to reach the Finals!
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
