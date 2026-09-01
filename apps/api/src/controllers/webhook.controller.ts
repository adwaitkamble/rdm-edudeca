import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { UserModel } from '../models/User';

export const handleClerkWebhook = async (req: Request, res: Response): Promise<void> => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  // Retrieve Svix headers
  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  // Extract raw body payload string
  let payloadString = '';
  if (Buffer.isBuffer(req.body)) {
    payloadString = req.body.toString('utf8');
  } else if (typeof req.body === 'string') {
    payloadString = req.body;
  } else {
    payloadString = JSON.stringify(req.body);
  }

  let evt: any;

  // Verify signature if secret is present and not a default placeholder
  if (webhookSecret && !webhookSecret.includes('placeholder') && svixId && svixTimestamp && svixSignature) {
    try {
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(payloadString, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[Clerk Webhook] Signature verification failed:', err.message);
      res.status(400).json({
        success: false,
        error: 'Invalid webhook signature.',
      });
      return;
    }
  } else {
    try {
      evt = JSON.parse(payloadString);
    } catch (_parseErr) {
      evt = req.body;
    }
  }

  const eventType = evt?.type;
  const data = evt?.data;

  // eslint-disable-next-line no-console
  console.log(`[Clerk Webhook] Received event: ${eventType} for ID: ${data?.id}`);

  try {
    switch (eventType) {
      case 'user.created': {
        const clerkId = data.id;
        const email =
          data.email_addresses?.[0]?.email_address ||
          data.primary_email_address_id ||
          `${clerkId}@clerk.user`;
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Whiz Student';

        await UserModel.findByIdAndUpdate(
          clerkId,
          {
            _id: clerkId,
            name: fullName,
            email,
            level: 0,
            streak: 0,
            rdmBalance: 0,
            quizzesCompleted: 0,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        // eslint-disable-next-line no-console
        console.log(`[Clerk Webhook] User created/synced: ${clerkId} (${email})`);
        break;
      }

      case 'user.updated': {
        const clerkId = data.id;
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const email = data.email_addresses?.[0]?.email_address;

        const updateFields: Record<string, any> = {};
        if (fullName) updateFields.name = fullName;
        if (email) updateFields.email = email;

        if (Object.keys(updateFields).length > 0) {
          await UserModel.findByIdAndUpdate(clerkId, updateFields);
          // eslint-disable-next-line no-console
          console.log(`[Clerk Webhook] User updated: ${clerkId}`);
        }
        break;
      }

      case 'user.deleted': {
        const clerkId = data.id;
        if (clerkId) {
          await UserModel.findByIdAndDelete(clerkId);
          // eslint-disable-next-line no-console
          console.log(`[Clerk Webhook] User deleted: ${clerkId}`);
        }
        break;
      }

      default:
        // eslint-disable-next-line no-console
        console.log(`[Clerk Webhook] Unhandled event type: ${eventType}`);
    }

    res.status(200).json({ success: true, message: 'Webhook received successfully.' });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Clerk Webhook] Database processing error:', err);
    res.status(500).json({ success: false, error: 'Failed to process webhook event.' });
  }
};
