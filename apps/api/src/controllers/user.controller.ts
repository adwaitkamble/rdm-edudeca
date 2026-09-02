import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { UserModel } from '../models/User';

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.body?.userId || req.userId;
    let user = req.userDoc;

    if (!user && userId) {
      user = await UserModel.findById(userId);
    }

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User profile not found in database.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[User Controller] Error fetching user profile:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile.',
    });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.body?.userId || req.userId;
    const {
      classGrade,
      scienceStream,
      institution,
      state,
      city,
      level4Consent,
      selectedTrack,
      name,
      email,
      level,
      streak,
      rdmBalance,
      quizzesCompleted,
    } = req.body;

    const updateFields: Record<string, any> = {};
    if (classGrade !== undefined) updateFields.classGrade = classGrade;
    if (scienceStream !== undefined) updateFields.scienceStream = Boolean(scienceStream);
    if (institution !== undefined) updateFields.institution = institution.trim();
    if (state !== undefined) updateFields.state = state.trim();
    if (city !== undefined) updateFields.city = city.trim();
    if (level4Consent !== undefined) updateFields.level4Consent = Boolean(level4Consent);
    if (selectedTrack !== undefined) updateFields.selectedTrack = selectedTrack;
    if (name !== undefined && name.trim()) updateFields.name = name.trim();
    if (email !== undefined && email.trim()) updateFields.email = email.trim().toLowerCase();
    if (level !== undefined) updateFields.level = Number(level);
    if (streak !== undefined) updateFields.streak = Number(streak);
    if (rdmBalance !== undefined) updateFields.rdmBalance = Number(rdmBalance);
    if (quizzesCompleted !== undefined) updateFields.quizzesCompleted = Number(quizzesCompleted);

    let user = await UserModel.findById(userId);

    if (!user) {
      // Auto-generate referral code for new user
      const cleanName = ((name || 'WHIZ') as string).replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const referralCode = `${cleanName || 'EDUD'}${randomSuffix}`;

      user = await UserModel.create({
        _id: userId,
        name: name || 'Whiz Student',
        email: email ? email.trim().toLowerCase() : `${userId}@edudeca.student`,
        referralCode,
        ...updateFields,
      });
    } else {
      // Ensure registered email is immutable once assigned
      if (user.email && !user.email.endsWith('@edudeca.student')) {
        delete updateFields.email;
      }
      Object.assign(user, updateFields);
      await user.save();
    }

    // eslint-disable-next-line no-console
    console.log(`[User Controller] ✅ Saved complete onboarding data in MongoDB for user "${userId}":`, {
      classGrade: user.classGrade,
      scienceStream: user.scienceStream,
      institution: user.institution,
      state: user.state,
      city: user.city,
      level4Consent: user.level4Consent,
      selectedTrack: user.selectedTrack,
    });

    res.status(200).json({
      success: true,
      data: user.toJSON(),
      message: 'Profile synchronized and saved in database successfully.',
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[User Controller] Error updating profile:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to update user profile in database.',
    });
  }
};

export const syncUser = updateProfile;
