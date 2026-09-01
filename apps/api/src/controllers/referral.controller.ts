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
