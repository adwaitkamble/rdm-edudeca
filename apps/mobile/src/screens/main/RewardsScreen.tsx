import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, borderRadius, spacing, Card } from '@edudeca/ui';
import { useAppStore } from '../../store/useAppStore';
import { Star, Gift, ShieldCheck, Zap } from 'lucide-react-native';

export const RewardsScreen: React.FC = () => {
  const rdmBalance = useAppStore((state) => state.rdmBalance);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⭐ Rewards &amp; Badges</Text>
          <Text style={styles.headerSub}>
            Redeem your hard-earned RDM points for scholarships and gear.
          </Text>
        </View>

        {/* Current RDM Balance Card */}
        <Card style={styles.balanceCard}>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>R</Text>
          </View>
          <Text style={styles.balanceLabel}>Your Total RDM Balance</Text>
          <Text style={styles.balanceVal}>
            {rdmBalance.toLocaleString('en-IN')}{' '}
            <Text style={{ fontSize: 16, color: colors.teal }}>RDM</Text>
          </Text>
        </Card>

        {/* Coming Soon Notice Card */}
        <Card style={styles.comingSoonCard}>
          <View style={styles.iconCircle}>
            <Gift size={24} color={colors.gold} />
          </View>
          <Text style={styles.csTitle}>Rewards Vault Opening Soon</Text>
          <Text style={styles.csSub}>
            The EduDeca merchandise store, exam sponsorship vouchers, and Metro Finals cash prize pool will unlock in the next release!
          </Text>
        </Card>

        {/* Reward Tiers Preview */}
        <View style={styles.rewardTier}>
          <ShieldCheck size={20} color={colors.teal} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tierName}>College Proctored Voucher</Text>
            <Text style={styles.tierCost}>500 RDM · 100% Fee Waiver</Text>
          </View>
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>LOCKED</Text>
          </View>
        </View>

        <View style={styles.rewardTier}>
          <Zap size={20} color={colors.purple} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tierName}>EduDeca Champion Jersey</Text>
            <Text style={styles.tierCost}>1,500 RDM · Exclusive Swag</Text>
          </View>
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>LOCKED</Text>
          </View>
        </View>
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
    paddingTop: 20,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 12,
    color: colors.muted,
  },
  balanceCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  coinBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  coinText: {
    fontSize: 18,
    fontWeight: typography.fontWeight.black,
    color: '#1a1400',
  },
  balanceLabel: {
    fontSize: 11,
    color: colors.mutedDim,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceVal: {
    fontSize: 32,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  comingSoonCard: {
    alignItems: 'center',
    padding: spacing.base + 4,
    backgroundColor: colors.card2,
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.goldAlpha10,
    borderWidth: 1,
    borderColor: colors.goldAlpha35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  csTitle: {
    fontSize: 15,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 6,
  },
  csSub: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  rewardTier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 10,
  },
  tierName: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  tierCost: {
    fontSize: 10.5,
    color: colors.mutedDim,
  },
  lockedBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  lockedText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.mutedDim,
  },
});
