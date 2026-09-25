import { Router } from 'express';
import { authenticate, requireRole, optionalAuthenticate } from '../middleware/auth';
import {
  searchParking, getParkingById, createParking, updateParking, deleteParking,
} from '../controllers/parking.controller';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/reviews.controller';
import { createReport } from '../controllers/reports.controller';

const router = Router();

// Public
router.get('/', searchParking);
router.get('/:id', getParkingById);

// Protected
router.post('/', authenticate, requireRole('operator', 'admin'), createParking);
router.patch('/:id', authenticate, requireRole('operator', 'admin'), updateParking);
router.delete('/:id', authenticate, requireRole('operator', 'admin'), deleteParking);

// Reviews (nested under parking)
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', authenticate, createReview);

// Reports
router.post('/:id/reports', optionalAuthenticate, createReport);

export default router;
