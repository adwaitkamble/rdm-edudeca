import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Button } from '@edudeca/ui';
import { ArrowLeft } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';

type LevelSelectScreenNavigationProp = NativeStackNavigationProp<
  DashboardStackParamList,
  'LevelSelect'
>;

interface LevelSelectScreenProps {
  navigation?: any;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ navigation }) => {
  const level = useAppStore((state) => state.level);
  const [selectedLength, setSelectedLength] = useState<10 | 20 | 30>(10);

  const handleStart = () => {
    navigation.navigate('Quiz', { quizLength: selectedLength });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Level {Math.max(1, level)} · Free Play
          </Text>
        </View>

        <Text style={styles.subText}>
          Pick how many questions you want to take today. Longer rounds earn more RDM.
        </Text>

        {/* Option 1: Quick Round (10 Qs) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.levelOpt,
            selectedLength === 10 && styles.levelOptSelected,
          ]}
          onPress={() => setSelectedLength(10)}
        >
          <View style={styles.loLeft}>
            <Text style={styles.loTitle}>Quick Round</Text>
            <Text style={styles.loSub}>10 questions · ~5 min</Text>
          </View>
          <Text style={styles.loBadge}>+50 RDM</Text>
        </TouchableOpacity>

        {/* Option 2: Standard Round (20 Qs) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.levelOpt,
            selectedLength === 20 && styles.levelOptSelected,
          ]}
          onPress={() => setSelectedLength(20)}
        >
          <View style={styles.loLeft}>
            <Text style={styles.loTitle}>Standard Round</Text>
            <Text style={styles.loSub}>20 questions · ~10 min</Text>
          </View>
          <Text style={styles.loBadge}>+110 RDM</Text>
        </TouchableOpacity>

        {/* Option 3: Full Round (30 Qs) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.levelOpt,
            selectedLength === 30 && styles.levelOptSelected,
          ]}
          onPress={() => setSelectedLength(30)}
        >
          <View style={styles.loLeft}>
            <Text style={styles.loTitle}>Full Round</Text>
            <Text style={styles.loSub}>30 questions · ~15 min</Text>
          </View>
          <Text style={styles.loBadge}>+180 RDM</Text>
        </TouchableOpacity>

        {/* Start Button */}
        <Button
          title="Start Round →"
          onPress={handleStart}
          variant="primary"
          style={styles.startBtn}
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
    paddingTop: 14,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
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
  subText: {
    color: colors.muted,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 18,
  },
  levelOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderRadius: borderRadius.md + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 12,
  },
  levelOptSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.tealAlpha10,
  },
  loLeft: {
    flex: 1,
  },
  loTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  loSub: {
    fontSize: 11,
    color: colors.mutedDim,
  },
  loBadge: {
    fontSize: 11,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
  },
  startBtn: {
    marginTop: 8,
  },
});
