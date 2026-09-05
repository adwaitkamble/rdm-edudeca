import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Share,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../navigation/types';
import { colors, typography, borderRadius, spacing, Button, Card } from '@edudeca/ui';
import { useAppStore } from '../../store/useAppStore';
import {
  ArrowLeft,
  Rocket,
  Paperclip,
  X,
  Mail,
  Phone,
  Copy,
  Share2,
  Users,
  Crown,
  Zap,
  UserPlus,
} from 'lucide-react-native';
import { referralService } from '../../services';
import { CommunityRoom, CommunityMember } from '@edudeca/types';
import * as Clipboard from 'expo-clipboard';

type ReferScreenNavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Refer'>;

interface ReferScreenProps {
  navigation?: any;
}

export const ReferScreen: React.FC<ReferScreenProps> = ({ navigation }) => {
  const user = useAppStore((state) => state.user);
  const referralCode = useAppStore((state) => state.user.referralCode);
  const referredContacts = useAppStore((state) => state.referredContacts);
  const addReferredContact = useAppStore((state) => state.addReferredContact);
  const addRdm = useAppStore((state) => state.addRdm);

  // Community Room State
  const [myRoom, setMyRoom] = useState<CommunityRoom | null>(null);
  const [joinedRoom, setJoinedRoom] = useState<CommunityRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Join Room State
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  // Invite via Email/Phone State
  const [inviteMode, setInviteMode] = useState<'email' | 'phone'>('email');
  const [inputValue, setInputValue] = useState('');
  const [chips, setChips] = useState<string[]>([]);
  const [showInviteSection, setShowInviteSection] = useState(false);

  // Active tab: 'my-room' vs 'joined-room'
  const [activeTab, setActiveTab] = useState<'my-room' | 'joined-room'>('my-room');

  // Load community room data
  const loadRoomData = useCallback(async () => {
    try {
      const [myRoomData, joinedRoomData] = await Promise.all([
        referralService.fetchMyRoom(user?.id),
        referralService.fetchJoinedRoom(user?.id),
      ]);
      setMyRoom(myRoomData);
      setJoinedRoom(joinedRoomData);
    } catch (_err) {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadRoomData();
  }, [loadRoomData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoomData();
    setRefreshing(false);
  };

  // Copy room code to clipboard
  const handleCopyCode = async () => {
    const code = referralCode || 'EDUD1000';
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert('Copied!', `Room code ${code} copied to clipboard.`);
    } catch (_err) {
      Alert.alert('Room Code', code);
    }
  };

  // Share room via native share sheet
  const handleShareRoom = async () => {
    const code = referralCode || 'EDUD1000';
    try {
      await Share.share({
        message: `🏆 Join my EduDeca Whiz Squad!\n\n🔑 Room Code: ${code}\n\nDownload EduDeca, sign up, and enter my room code to join my squad. We'll both earn +50 RDM coins! 🚀\n\n#EduDeca #WhizSquad`,
      });
    } catch (_err) {
      // User cancelled share
    }
  };

  // Join a squad room
  const handleJoinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Enter Code', 'Please enter a squad room code to join.');
      return;
    }

    // Prevent joining own room
    if (code === (referralCode || '').toUpperCase()) {
      Alert.alert('Cannot Join', 'You cannot join your own squad room.');
      return;
    }

    setJoining(true);
    try {
      const result = await referralService.joinCommunityRoom(code, user?.id);
      setJoinedRoom(result.room);
      addRdm(result.awardedRdm);
      Alert.alert('Welcome! 🎉', result.message);
      setJoinCode('');
      setActiveTab('joined-room');
      // Reload to get fresh data
      await loadRoomData();
    } catch (err: any) {
      Alert.alert('Failed to Join', err.message || 'Could not join this squad room.');
    } finally {
      setJoining(false);
    }
  };

  // Invite contacts batch
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

  const handleSendInvites = async () => {
    if (chips.length === 0) return;

    const contactsPayload = chips.map((c) => ({
      name: c.includes('@') ? c.split('@')[0] : `Friend (${c})`,
      phone: inviteMode === 'phone' ? c : undefined,
      email: inviteMode === 'email' ? c : undefined,
    }));

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
      'Invitations Sent! 🚀',
      `Brochure and room code sent to ${chips.length} contact${chips.length > 1 ? 's' : ''}!`
    );
    setChips([]);
  };

  // Generate avatar initial & color
  const getAvatarColor = (name: string, idx: number): string => {
    const palette = [colors.teal, colors.purple, colors.amber, colors.blue, colors.pink, colors.gold];
    return palette[idx % palette.length];
  };

  const roomCode = referralCode || 'EDUD1000';
  const displayRoom = activeTab === 'my-room' ? myRoom : joinedRoom;

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
          <Text style={styles.headerTitle}>Community & Refer</Text>
        </View>

        {/* ═══════════════════════════════════════ */}
        {/* 👑 MY SQUAD ROOM HERO CARD              */}
        {/* ═══════════════════════════════════════ */}
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.crownIcon}>
              <Crown size={18} color={colors.gold} />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>
                ⚡ {user.name?.split(' ')[0] || 'Whiz'}'s Squad Room
              </Text>
              <Text style={styles.heroDesc}>
                Share your room code and build your Whiz Squad
              </Text>
            </View>
          </View>

          {/* Room Code Badge + Actions */}
          <View style={styles.codeBadgeRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeLabel}>ROOM CODE</Text>
              <Text style={styles.codeValue}>{roomCode}</Text>
            </View>
            <View style={styles.codeActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.codeActionBtn}
                onPress={handleCopyCode}
              >
                <Copy size={14} color={colors.teal} />
                <Text style={styles.codeActionText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.codeActionBtn, styles.shareActionBtn]}
                onPress={handleShareRoom}
              >
                <Share2 size={14} color="#062017" />
                <Text style={[styles.codeActionText, { color: '#062017' }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Squad Stats Mini */}
          <View style={styles.squadStatsRow}>
            <View style={styles.squadStat}>
              <Users size={14} color={colors.teal} />
              <Text style={styles.squadStatVal}>
                {myRoom?.totalMembers ?? 0}
              </Text>
              <Text style={styles.squadStatLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.squadStat}>
              <Zap size={14} color={colors.gold} />
              <Text style={styles.squadStatVal}>
                {(myRoom?.collectiveRdm ?? 0).toLocaleString('en-IN')}
              </Text>
              <Text style={styles.squadStatLabel}>Collective RDM</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.squadStat}>
              <Rocket size={14} color={colors.purple} />
              <Text style={styles.squadStatVal}>
                {referredContacts.length}
              </Text>
              <Text style={styles.squadStatLabel}>Invited</Text>
            </View>
          </View>
        </Card>

        {/* ═══════════════════════════════════════ */}
        {/* ⚡ JOIN A SQUAD ROOM                      */}
        {/* ═══════════════════════════════════════ */}
        <Card style={styles.joinCard}>
          <View style={styles.joinHeader}>
            <UserPlus size={16} color={colors.purple} />
            <Text style={styles.joinTitle}>Join a Squad Room</Text>
          </View>
          <Text style={styles.joinDesc}>
            Enter a friend's referral code to join their squad. Both of you earn +50 RDM! 🎁
          </Text>
          <View style={styles.joinInputRow}>
            <TextInput
              style={styles.joinInput}
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase())}
              placeholder="Enter room code (e.g. WHIZ1234)"
              placeholderTextColor={colors.mutedDim}
              autoCapitalize="characters"
              maxLength={12}
              onSubmitEditing={handleJoinRoom}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.joinBtn, joining && { opacity: 0.6 }]}
              onPress={handleJoinRoom}
              disabled={joining}
            >
              {joining ? (
                <ActivityIndicator size="small" color="#062017" />
              ) : (
                <Text style={styles.joinBtnText}>Join →</Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* ═══════════════════════════════════════ */}
        {/* TAB SWITCHER: My Room / Joined Room     */}
        {/* ═══════════════════════════════════════ */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabItem, activeTab === 'my-room' && styles.tabItemActive]}
            onPress={() => setActiveTab('my-room')}
          >
            <Crown size={13} color={activeTab === 'my-room' ? colors.teal : colors.muted} />
            <Text style={[styles.tabText, activeTab === 'my-room' && styles.tabTextActive]}>
              My Squad
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabItem, activeTab === 'joined-room' && styles.tabItemActive]}
            onPress={() => setActiveTab('joined-room')}
          >
            <Users size={13} color={activeTab === 'joined-room' ? colors.teal : colors.muted} />
            <Text style={[styles.tabText, activeTab === 'joined-room' && styles.tabTextActive]}>
              Joined Squad
            </Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════ */}
        {/* SQUAD MEMBER LIST                        */}
        {/* ═══════════════════════════════════════ */}
        <Card style={styles.membersCard}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.teal} />
              <Text style={styles.loadingText}>Loading squad...</Text>
            </View>
          ) : !displayRoom || displayRoom.totalMembers === 0 ? (
            <View style={styles.emptyBox}>
              <Users size={28} color={colors.mutedDim} />
              <Text style={styles.emptyTitle}>
                {activeTab === 'my-room'
                  ? 'No members yet'
                  : 'Not in any squad'}
              </Text>
              <Text style={styles.emptyDesc}>
                {activeTab === 'my-room'
                  ? 'Share your room code above to invite classmates!'
                  : 'Enter a friend\'s code above to join their squad.'}
              </Text>
            </View>
          ) : (
            <>
              {/* Host header for joined room */}
              {activeTab === 'joined-room' && displayRoom && (
                <View style={styles.hostBanner}>
                  <View style={styles.hostAvatar}>
                    <Text style={styles.hostAvatarText}>
                      {(displayRoom.hostName || 'W')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hostName}>{displayRoom.hostName}'s Squad</Text>
                    <Text style={styles.hostInst}>
                      {displayRoom.hostInstitution || 'EduDeca Student'}
                    </Text>
                  </View>
                  <View style={styles.hostCodeBadge}>
                    <Text style={styles.hostCodeText}>{displayRoom.roomCode}</Text>
                  </View>
                </View>
              )}

              <Text style={styles.membersSectionTitle}>
                Squad Members ({displayRoom.totalMembers})
              </Text>

              {displayRoom.members.map((member: CommunityMember, idx: number) => (
                <View
                  key={member.userId}
                  style={[
                    styles.memberRow,
                    idx === displayRoom.members.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={[styles.memberAvatar, { backgroundColor: getAvatarColor(member.name, idx) }]}>
                    <Text style={styles.memberAvatarText}>
                      {(member.name || 'S')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                    <Text style={styles.memberMeta} numberOfLines={1}>
                      {member.institution || member.classGrade || 'Student'}
                    </Text>
                  </View>
                  <View style={styles.memberStats}>
                    <Text style={styles.memberLevel}>Lv {member.level}</Text>
                    <Text style={styles.memberRdm}>{member.rdmBalance} RDM</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </Card>

        {/* ═══════════════════════════════════════ */}
        {/* 📨 DIRECT INVITE SECTION                 */}
        {/* ═══════════════════════════════════════ */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.inviteToggle}
          onPress={() => setShowInviteSection(!showInviteSection)}
        >
          <Mail size={14} color={colors.teal} />
          <Text style={styles.inviteToggleText}>
            {showInviteSection ? 'Hide Direct Invite' : '📨 Invite via Email / Phone'}
          </Text>
        </TouchableOpacity>

        {showInviteSection && (
          <Card style={styles.inviteCard}>
            <Text style={styles.inviteTitle}>Invite Contacts</Text>

            {/* Mode Tabs */}
            <View style={styles.modeTabRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.modeTab, inviteMode === 'email' && styles.modeTabActive]}
                onPress={() => {
                  setInviteMode('email');
                  setInputValue('');
                }}
              >
                <Mail size={14} color={inviteMode === 'email' ? colors.teal : colors.muted} />
                <Text style={[styles.modeTabText, inviteMode === 'email' && styles.modeTabTextActive]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.modeTab, inviteMode === 'phone' && styles.modeTabActive]}
                onPress={() => {
                  setInviteMode('phone');
                  setInputValue('');
                }}
              >
                <Phone size={14} color={inviteMode === 'phone' ? colors.teal : colors.muted} />
                <Text style={[styles.modeTabText, inviteMode === 'phone' && styles.modeTabTextActive]}>
                  Mobile
                </Text>
              </TouchableOpacity>
            </View>

            {/* Input + Add */}
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
                keyboardType={inviteMode === 'email' ? 'email-address' : 'phone-pad'}
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

            {/* Chips */}
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
                "Join my EduDeca Whiz Squad! 🏆 Use my room code: {roomCode} to join and we'll both earn +50 RDM coins! 🚀"
              </Text>
              <View style={styles.msgAttach}>
                <Paperclip size={12} color={colors.muted} />
                <Text style={styles.msgAttachText}>EduDeca_Brochure.pdf</Text>
              </View>
            </View>

            <Button
              title="Send Invites →"
              onPress={handleSendInvites}
              disabled={chips.length === 0}
              variant="primary"
            />
          </Card>
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

  /* ─── Hero Card ─── */
  heroCard: {
    padding: spacing.base,
    marginBottom: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  crownIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.goldAlpha12,
    borderWidth: 1,
    borderColor: colors.goldAlpha35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 11.5,
    color: colors.muted,
    lineHeight: 17,
  },

  /* ─── Code Badge ─── */
  codeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  codeBadge: {},
  codeLabel: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.mutedDim,
    marginBottom: 3,
  },
  codeValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 18,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.teal,
    letterSpacing: 1.5,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  codeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    backgroundColor: colors.tealAlpha10,
  },
  shareActionBtn: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  codeActionText: {
    fontSize: 11.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },

  /* ─── Squad Stats ─── */
  squadStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  squadStat: {
    alignItems: 'center',
    gap: 4,
  },
  squadStatVal: {
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
  },
  squadStatLabel: {
    fontSize: 9.5,
    fontWeight: typography.fontWeight.semibold,
    color: colors.mutedDim,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },

  /* ─── Join Card ─── */
  joinCard: {
    padding: spacing.base,
    marginBottom: 12,
  },
  joinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  joinTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  joinDesc: {
    fontSize: 11.5,
    color: colors.muted,
    lineHeight: 17,
    marginBottom: 12,
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  joinInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  joinBtn: {
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.extrabold,
    color: '#062017',
  },

  /* ─── Tab Switcher ─── */
  tabSwitcher: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  tabItemActive: {
    borderColor: colors.teal,
    backgroundColor: colors.tealAlpha10,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.teal,
  },

  /* ─── Members Card ─── */
  membersCard: {
    padding: spacing.base,
    marginBottom: 14,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: colors.muted,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Host banner for joined room */
  hostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostAvatarText: {
    fontSize: 15,
    fontWeight: typography.fontWeight.extrabold,
    color: '#1a1400',
  },
  hostName: {
    fontSize: 13.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  hostInst: {
    fontSize: 11,
    color: colors.muted,
  },
  hostCodeBadge: {
    backgroundColor: colors.goldAlpha12,
    borderWidth: 1,
    borderColor: colors.goldAlpha35,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.round,
  },
  hostCodeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.gold,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* Member rows */
  membersSectionTitle: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  memberMeta: {
    fontSize: 10.5,
    color: colors.muted,
    marginTop: 1,
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  memberLevel: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  memberRdm: {
    fontSize: 10,
    color: colors.gold,
    fontWeight: typography.fontWeight.semibold,
  },

  /* ─── Direct Invite Toggle ─── */
  inviteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.tealAlpha35,
    backgroundColor: colors.tealAlpha10,
    marginBottom: 12,
  },
  inviteToggleText: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },

  /* ─── Invite Card ─── */
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
  modeTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modeTab: {
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
  modeTabActive: {
    borderColor: colors.teal,
    backgroundColor: colors.tealAlpha10,
  },
  modeTabText: {
    fontSize: 12.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  modeTabTextActive: {
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
