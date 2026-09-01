import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Button, Card } from '@edudeca/ui';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft, Rocket, Paperclip, X, Mail, Phone } from 'lucide-react-native';
import { referralService } from '../../services';

type ReferScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Refer'>;

interface ReferScreenProps {
  navigation?: any;
}

export const ReferScreen: React.FC<ReferScreenProps> = ({ navigation }) => {
  const user = useAppStore((state) => state.user);
  const referralCode = useAppStore((state) => state.user.referralCode);
  const referredContacts = useAppStore((state) => state.referredContacts);
  const addReferredContact = useAppStore((state) => state.addReferredContact);

  const [inviteMode, setInviteMode] = useState<'email' | 'phone'>('email');
  const [inputValue, setInputValue] = useState<string>('');
  const [chips, setChips] = useState<string[]>([]);
  const [showWhoJoined, setShowWhoJoined] = useState<boolean>(false);

  const scrollRef = useRef<ScrollView>(null);

  const handleAddChip = () => {
    const val = inputValue.trim();
    if (!val) return;

    if (inviteMode === 'email') {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!emailOk) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
    } else {
      const phoneOk = /^[0-9+\-\s]{7,15}$/.test(val);
      if (!phoneOk) {
        Alert.alert('Invalid Mobile', 'Please enter a valid phone number.');
        return;
      }
    }

    if (chips.includes(val)) {
      Alert.alert('Duplicate', 'This contact has already been added.');
      return;
    }

    setChips([...chips, val]);
    setInputValue('');
  };

  const handleRemoveChip = (val: string) => {
    setChips(chips.filter((c) => c !== val));
  };

  const handleShare = async () => {
    if (chips.length === 0) return;

    const contactsPayload = chips.map((c) => ({
      name: c.includes('@') ? c.split('@')[0] : `Friend (${c})`,
      phone: inviteMode === 'phone' ? c : undefined,
      email: inviteMode === 'email' ? c : undefined,
    }));

    // Update local Zustand state
    chips.forEach((c, idx) => {
      addReferredContact({
        id: `ref_${Date.now()}_${idx}`,
        name: c.includes('@') ? c.split('@')[0] : `Friend (${c})`,
        initial: c.charAt(0).toUpperCase(),
        color: colors.teal,
        email: inviteMode === 'email' ? c : undefined,
        phone: inviteMode === 'phone' ? c : undefined,
        status: 'pending',
      });
    });

    try {
      await referralService.submitBatchReferrals(contactsPayload, user?.id);
    } catch (_err) {
      // Offline fallback
    }

    Alert.alert(
      'Brochure Sent!',
      `📎 EduDeca brochure and invitation link sent to ${chips.length} contact${
        chips.length > 1 ? 's' : ''
      }!`
    );
    setChips([]);
  };

  const scrollToInvite = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
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
          <Text style={styles.headerTitle}>Refer Friends</Text>
        </View>

        {/* Hero Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.rocketIcon}>
              <Rocket size={20} color={colors.teal} />
            </View>
            <View style={styles.heroTextWrap}>
              <View style={styles.titleBadgeRow}>
                <Text style={styles.heroCardTitle}>Refer friends</Text>
                <View style={styles.joinedBadge}>
                  <Text style={styles.joinedBadgeText}>
                    {referredContacts.length} joined
                  </Text>
                </View>
              </View>
              <Text style={styles.heroDesc}>
                Invite classmates with your personal link. They sign up → they land in your referral list.
              </Text>
              <View style={styles.codeWrap}>
                <Text style={styles.codeText}>{referralCode}</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroBtnRow}>
            <Button
              title="🔗 Refer now"
              onPress={scrollToInvite}
              variant="primary"
              style={{ flex: 1 }}
            />
            <Button
              title="👥 Who joined"
              onPress={() => setShowWhoJoined(!showWhoJoined)}
              variant="ghost"
              style={{ flex: 1 }}
            />
          </View>

          {/* Who Joined Dropdown Block */}
          {showWhoJoined && (
            <View style={styles.whoJoinedBlock}>
              {referredContacts.length === 0 ? (
                <Text style={styles.emptyJoinedText}>
                  No one has joined yet — share your link to get started.
                </Text>
              ) : (
                referredContacts.map((contact) => (
                  <View key={contact.id} style={styles.joinedItem}>
                    <View
                      style={[
                        styles.joinedAvatar,
                        { backgroundColor: contact.color || colors.teal },
                      ]}
                    >
                      <Text style={styles.joinedAvatarText}>
                        {contact.initial}
                      </Text>
                    </View>
                    <Text style={styles.joinedName}>{contact.name}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </Card>

        {/* Invite via Block */}
        <Card style={styles.inviteCard}>
          <Text style={styles.inviteTitle}>Invite via</Text>

          {/* Mode Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabBtn,
                inviteMode === 'email' && styles.tabBtnActive,
              ]}
              onPress={() => {
                setInviteMode('email');
                setInputValue('');
              }}
            >
              <Mail
                size={14}
                color={inviteMode === 'email' ? colors.teal : colors.muted}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  inviteMode === 'email' && styles.tabBtnTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.tabBtn,
                inviteMode === 'phone' && styles.tabBtnActive,
              ]}
              onPress={() => {
                setInviteMode('phone');
                setInputValue('');
              }}
            >
              <Phone
                size={14}
                color={inviteMode === 'phone' ? colors.teal : colors.muted}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  inviteMode === 'phone' && styles.tabBtnTextActive,
                ]}
              >
                Mobile
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input + Add Button */}
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={
                inviteMode === 'email'
                  ? 'Enter email address'
                  : 'Enter mobile number'
              }
              placeholderTextColor={colors.mutedDim}
              keyboardType={
                inviteMode === 'email' ? 'email-address' : 'phone-pad'
              }
              autoCapitalize="none"
              onSubmitEditing={handleAddChip}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addBtn}
              onPress={handleAddChip}
            >
              <Text style={styles.addBtnText}>＋</Text>
            </TouchableOpacity>
          </View>

          {/* Invite Chips */}
          <View style={styles.chipsContainer}>
            {chips.map((item) => (
              <View key={item} style={styles.inviteChip}>
                <Text style={styles.chipText}>{item}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.rmBtn}
                  onPress={() => handleRemoveChip(item)}
                >
                  <X size={10} color={colors.text} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Message Preview */}
          <View style={styles.msgPreview}>
            <Text style={styles.msgPreviewLabel}>Message preview</Text>
            <Text style={styles.msgPreviewText}>
              "I have joined the EduDeca challenge, do you also want to join? If so, click the link below 👇"
            </Text>
            <View style={styles.msgAttach}>
              <Paperclip size={12} color={colors.muted} />
              <Text style={styles.msgAttachText}>EduDeca_Brochure.pdf</Text>
            </View>
          </View>

          {/* Share Button */}
          <Button
            title="Share →"
            onPress={handleShare}
            disabled={chips.length === 0}
            variant="primary"
          />
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  heroCard: {
    padding: spacing.base,
    marginBottom: 14,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  rocketIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.tealAlpha12,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  heroCardTitle: {
    fontSize: 14.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  joinedBadge: {
    backgroundColor: colors.tealAlpha12,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: borderRadius.round,
  },
  joinedBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
  },
  heroDesc: {
    fontSize: 11.5,
    color: colors.muted,
    lineHeight: 17,
    marginBottom: 10,
  },
  codeWrap: {
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
    letterSpacing: 0.5,
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  whoJoinedBlock: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  emptyJoinedText: {
    fontSize: 12,
    color: colors.mutedDim,
    textAlign: 'center',
    paddingVertical: 8,
  },
  joinedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  joinedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedAvatarText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  joinedName: {
    fontSize: 12.5,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  inviteCard: {
    padding: spacing.base,
    marginBottom: 16,
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 10,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  tabBtnActive: {
    borderColor: colors.teal,
    backgroundColor: colors.tealAlpha10,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  tabBtnTextActive: {
    color: colors.teal,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.text,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 10,
    fontSize: 13,
  },
  addBtn: {
    width: 48,
    borderRadius: 10,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 18,
    fontWeight: typography.fontWeight.extrabold,
    color: '#062017',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  inviteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.round,
    paddingVertical: 5,
    paddingLeft: 12,
    paddingRight: 8,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  rmBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgPreview: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 13,
    marginBottom: 16,
  },
  msgPreviewLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: colors.text,
    marginBottom: 4,
  },
  msgPreviewText: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
  },
  msgAttach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  msgAttachText: {
    fontSize: 10.5,
    color: colors.muted,
  },
});
