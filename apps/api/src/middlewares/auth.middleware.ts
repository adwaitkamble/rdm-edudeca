import { Request, Response, NextFunction } from 'express';
import { UserModel, IUserDocument } from '../models/User';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userDoc?: any;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);

    if (!userId && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        // If token is a raw user ID (e.g. user_xxx or test_user)
        if (token.startsWith('user_') || token.startsWith('mock_') || token.length > 0) {
          userId = token;
        }
      }
    }

    if (!userId && req.body && req.body.userId) {
      userId = req.body.userId;
    }

    // In local development, fallback to a default dev user if not specified
    if (!userId && process.env.NODE_ENV !== 'production') {
      userId = 'user_dev_local_whiz';
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or invalid authentication credentials.',
      });
      return;
    }

    req.userId = userId;

    // Attach or auto-provision local user document if in dev mode
    let userDoc = await UserModel.findById(userId);
    if (!userDoc && process.env.NODE_ENV !== 'production') {
      userDoc = await UserModel.create({
        _id: userId,
        name: 'Local Whiz',
        email: `${userId}@edudeca.local`,
        classGrade: 'Class 11',
        scienceStream: true,
        institution: 'Indian Institute of Tech & Science',
        state: 'Maharashtra',
        city: 'Mumbai',
        level: 0,
        streak: 0,
        rdmBalance: 0,
        quizzesCompleted: 0,
      });
    }

    req.userDoc = userDoc;
    next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Auth Middleware] Error verifying user:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server authentication error.',
    });
  }
};
