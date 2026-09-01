import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Card } from '@edudeca/ui';
import { LEADERBOARD_DATA } from '../../utils/mockData';
import { ArrowLeft } from 'lucide-react-native';
import { LeaderboardEntry } from '@edudeca/types';
import { leaderboardService } from '../../services';

type LeaderboardScreenNavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'Leaderboard'
>;

interface LeaderboardScreenProps {
  navigation?: any;
}

const RANK_ICONS = ['👑', '🏆', '🥉'];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ navigation }) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchRankings = useCallback(async (level: number) => {
    try {
      setLoading(true);
      const data = await leaderboardService.fetchLeaderboardByLevel(level);
      if (data && data.length > 0) {
        setRankings(data);
      } else {
        // Fallback to sample data for preview if database has no live attempts yet for this level
        const sampleRows = (LEADERBOARD_DATA[level] || []).map((row, idx) => ({
          rank: idx + 1,
          userId: `user_sample_${idx}`,
          name: row.name,
          score: row.score,
          time: `${row.time} min`,
          rawScore: 10,
          rawTime: 30,
          color: row.color || colors.teal,
          institution: 'Top Whiz Institute',
        }));
        setRankings(sampleRows);
      }
    } catch (_err) {
      // Offline fallback: load mock data
      const sampleRows = (LEADERBOARD_DATA[level] || []).map((row, idx) => ({
        rank: idx + 1,
        userId: `user_sample_${idx}`,
        name: row.name,
        score: row.score,
        time: `${row.time} min`,
        rawScore: 10,
        rawTime: 30,
        color: row.color || colors.teal,
        institution: 'Top Whiz Institute',
      }));
      setRankings(sampleRows);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings(selectedLevel);
  }, [selectedLevel, fetchRankings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRankings(selectedLevel);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.teal}
            colors={[colors.teal]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
        </View>

        <Text style={styles.headerSub}>
          Top scorers per level, ranked by score then fastest completion time.
        </Text>

        {/* Level Horizontal Scrollable Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
            const isActive = lvl === selectedLevel;
            return (
              <TouchableOpacity
                key={lvl}
                activeOpacity={0.8}
                style={[styles.lvlTab, isActive && styles.lvlTabActive]}
                onPress={() => setSelectedLevel(lvl)}
              >
                <Text
                  style={[
                    styles.lvlTabText,
                    isActive && styles.lvlTabTextActive,
                  ]}
                >
                  L{lvl}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Leaderboard Card */}
        <Card style={styles.lbCard}>
          {loading && !refreshing ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.teal} style={{ marginBottom: 8 }} />
              <Text style={styles.loadingText}>Fetching live rankings for Level {selectedLevel}...</Text>
            </View>
          ) : rankings.length === 0 ? (
            <Text style={styles.emptyText}>
              No ranking records found for Level {selectedLevel}.
            </Text>
          ) : (
            rankings.map((row, index) => (
              <View
                key={row.userId || index}
                style={[
                  styles.lbRow,
                  index === rankings.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Text style={styles.lbRankIcon}>
                  {index < 3 ? RANK_ICONS[index] : `#${index + 1}`}
                </Text>

                <View
                  style={[
                    styles.lbAvatar,
                    {
                      backgroundColor:
                        (colors as any)[row.color] || row.color || colors.teal,
                    },
                  ]}
                >
                  <Text style={styles.lbAvatarText}>
                    {row.name ? row.name.charAt(0).toUpperCase() : 'W'}
                  </Text>
                </View>

                <View style={styles.lbInfo}>
                  <Text style={styles.lbName} numberOfLines={1}>
                    {row.name}
                  </Text>
                  <Text style={styles.lbTime}>⏱ {row.time}</Text>
                </View>

                <View style={styles.lbScoreBadge}>
                  <Text style={styles.lbScoreText}>{row.score}</Text>
                </View>
              </View>
            ))
          )}
        </Card>
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
    paddingTop: 14,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  headerSub: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 14,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: 7,
    paddingBottom: 6,
    marginBottom: 16,
  },
  lvlTab: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  lvlTabActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldAlpha10,
  },
  lvlTabText: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  lvlTabTextActive: {
    color: colors.gold,
  },
  lbCard: {
    padding: spacing.base,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: typography.fontWeight.medium,
  },
  emptyText: {
    fontSize: 12,
    color: colors.mutedDim,
    textAlign: 'center',
    paddingVertical: 12,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lbRankIcon: {
    fontSize: 16,
    width: 28,
    textAlign: 'center',
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  lbAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbAvatarText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  lbInfo: {
    flex: 1,
  },
  lbName: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  lbTime: {
    fontSize: 9.5,
    color: colors.mutedDim,
    marginTop: 2,
  },
  lbScoreBadge: {
    backgroundColor: colors.tealAlpha10,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.round,
  },
  lbScoreText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
  },
});
