import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { updateReview, deleteReview } from '../controllers/reviews.controller';

const router = Router();

router.patch('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
