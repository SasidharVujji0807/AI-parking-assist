import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optionalAuthenticate } from '../middleware/auth';
import { parseAIRequest, getAIRecommendations, aiChat } from '../controllers/ai.controller';

const router = Router();

// Strict rate limiting for AI endpoints (prevents abuse and cost overruns)
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests, please slow down' } },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(aiRateLimit);

router.post('/parse-request', parseAIRequest);
router.post('/recommend', optionalAuthenticate, getAIRecommendations);
router.post('/chat', optionalAuthenticate, aiChat);

export default router;
