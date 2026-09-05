import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ReferralModel } from '../models/Referral';
import { UserModel } from '../models/User';
import { ReferralBatchPayload } from '@edudeca/types';

export const submitBatchReferrals = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const inviterId = req.userId;
    if (!inviterId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const { contacts }: ReferralBatchPayload = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Contacts array is required and must not be empty.',
      });
      return;
    }

    const createdRecords = [];
    const bonusPerInvite = 50; // 50 RDM bonus per invited contact

    for (const contact of contacts) {
      if (!contact.name || !contact.name.trim()) continue;

      const record = await ReferralModel.create({
        inviterId,
        name: contact.name.trim(),
        phone: contact.phone?.trim() || '',
        email: contact.email?.trim() || '',
        status: 'pending',
        rewardPaid: true,
        rewardRdm: bonusPerInvite,
        invitedAt: new Date(),
      });
      createdRecords.push(record);
    }

    // Award RDM coin bonus to inviter
    const totalBonus = createdRecords.length * bonusPerInvite;
    if (totalBonus > 0) {
      await UserModel.findByIdAndUpdate(inviterId, {
        $inc: { rdmBalance: totalBonus },
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully invited ${createdRecords.length} contacts.`,
      awardedRdm: totalBonus,
      data: createdRecords.map((r) => r.toJSON()),
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Referral Controller] Error submitting referrals:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to submit referral contacts.',
    });
  }
};

export const getMyReferrals = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const inviterId = req.userId;
    if (!inviterId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const referrals = await ReferralModel.find({ inviterId }).sort({ invitedAt: -1 });

    const totalEarned = referrals
      .filter((r) => r.rewardPaid)
      .reduce((sum, r) => sum + (r.rewardRdm || 0), 0);

    res.status(200).json({
      success: true,
      count: referrals.length,
      totalEarnedRdm: totalEarned,
      data: referrals.map((r) => r.toJSON()),
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Referral Controller] Error fetching referrals:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve referral list.',
    });
  }
};

/**
 * Build a CommunityRoom object from a host user and their referral member records.
 */
const buildRoomData = async (host: any) => {
  // Find all referral records that have a registered memberId for this host
  const memberRefs = await ReferralModel.find({
    inviterId: host._id,
    memberId: { $ne: null },
    status: { $in: ['joined', 'signed_up', 'rewarded'] },
  }).sort({ joinedAt: -1 });

  const memberIds = memberRefs
    .map((r: any) => r.memberId)
    .filter((id: any) => !!id);

  const memberUsers = memberIds.length > 0
    ? await UserModel.find({ _id: { $in: memberIds } })
    : [];

  const memberMap = new Map(memberUsers.map((u) => [u._id.toString(), u]));

  const members = memberRefs
    .map((r: any) => {
      const u = memberMap.get(r.memberId);
      if (!u) return null;
      return {
        userId: u._id.toString(),
        name: u.name || 'Student',
        institution: u.institution || '',
        classGrade: u.classGrade || '',
        level: u.level || 0,
        rdmBalance: u.rdmBalance || 0,
        joinedAt: r.joinedAt || r.invitedAt,
      };
    })
    .filter(Boolean);

  const collectiveRdm = members.reduce(
    (sum: number, m: any) => sum + (m.rdmBalance || 0),
    (host.rdmBalance || 0)
  );

  return {
    hostId: host._id.toString(),
    hostName: host.name || 'Whiz Student',
    hostInstitution: host.institution || '',
    roomCode: host.referralCode || '',
    members,
    totalMembers: members.length,
    collectiveRdm,
  };
};

/**
 * GET /api/referrals/my-room
 * Returns the current user's own squad room.
 */
export const getMyRoom = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const host = await UserModel.findById(userId);
    if (!host) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    const room = await buildRoomData(host);
    res.status(200).json({ success: true, data: room });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Referral Controller] Error fetching my room:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch room data.' });
  }
};

/**
 * GET /api/referrals/room/:code
 * Returns any squad room details by referral code.
 */
export const getRoomByCode = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;
    if (!code) {
      res.status(400).json({ success: false, error: 'Referral code is required.' });
      return;
    }

    const host = await UserModel.findOne({ referralCode: code.toUpperCase().trim() });
    if (!host) {
      res.status(404).json({ success: false, error: 'No squad room found with this code.' });
      return;
    }

    const room = await buildRoomData(host);
    res.status(200).json({ success: true, data: room });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Referral Controller] Error fetching room by code:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch room data.' });
  }
};

/**
 * POST /api/referrals/join-room
 * Body: { roomCode: string }
 * Joins the current user to the host's community squad room.
 */
export const joinRoom = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const { roomCode } = req.body;
    if (!roomCode || typeof roomCode !== 'string') {
      res.status(400).json({ success: false, error: 'Room code is required.' });
      return;
    }

    const code = roomCode.toUpperCase().trim();

    // Find the host user who owns this referral code
    const host = await UserModel.findOne({ referralCode: code });
    if (!host) {
      res.status(404).json({ success: false, error: 'No squad room found with this code.' });
      return;
    }

    // Prevent self-join
    if (host._id.toString() === userId) {
      res.status(400).json({ success: false, error: 'You cannot join your own squad room.' });
      return;
    }

    // Check if already a member
    const existing = await ReferralModel.findOne({
      inviterId: host._id,
      memberId: userId,
    });
    if (existing) {
      res.status(400).json({ success: false, error: 'You have already joined this squad room.' });
      return;
    }

    // Create membership referral record
    const joiner = await UserModel.findById(userId);
    const joinerName = joiner?.name || 'Student';

    await ReferralModel.create({
      inviterId: host._id,
      name: joinerName,
      email: joiner?.email || '',
      memberId: userId,
      status: 'joined',
      rewardPaid: true,
      rewardRdm: 50,
      invitedAt: new Date(),
      joinedAt: new Date(),
    });

    // Award +50 RDM to both host and joiner
    const communityBonus = 50;
    await UserModel.findByIdAndUpdate(host._id, {
      $inc: { rdmBalance: communityBonus },
    });
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { rdmBalance: communityBonus },
      $set: { joinedRoomCode: code },
    });

    const room = await buildRoomData(host);

    // eslint-disable-next-line no-console
    console.log(
      `[Referral Controller] ✅ User "${userId}" joined squad room "${code}" (Host: ${host._id}). +${communityBonus} RDM each.`
    );

    res.status(200).json({
      success: true,
      data: room,
      awardedRdm: communityBonus,
      message: `Welcome to ${host.name}'s squad! +${communityBonus} RDM bonus earned.`,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Referral Controller] Error joining room:', err);
    res.status(500).json({ success: false, error: 'Failed to join squad room.' });
  }
};

/**
 * GET /api/referrals/joined-room
 * Returns the squad room that the current user has joined (if any).
 */
export const getJoinedRoom = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user || !user.joinedRoomCode) {
      res.status(200).json({ success: true, data: null, message: 'Not a member of any squad room.' });
      return;
    }

    const host = await UserModel.findOne({ referralCode: user.joinedRoomCode });
    if (!host) {
      res.status(200).json({ success: true, data: null, message: 'Joined room host no longer exists.' });
      return;
    }

    const room = await buildRoomData(host);
    res.status(200).json({ success: true, data: room });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Referral Controller] Error fetching joined room:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch joined room.' });
  }
};

