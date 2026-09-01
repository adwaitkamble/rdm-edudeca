import { Router } from 'express';
import { handleClerkWebhook } from '../controllers/webhook.controller';

const router = Router();

// POST /api/webhooks/clerk
router.post('/clerk', handleClerkWebhook);

export const webhookRoutes = router;
