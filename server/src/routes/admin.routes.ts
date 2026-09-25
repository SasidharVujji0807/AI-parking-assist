import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  getAdminStats, getAdminUsers, getAdminParking,
  getAdminReviews, moderateReview,
} from '../controllers/admin.controller';
import { getAdminReports, updateReportStatus } from '../controllers/reports.controller';

const router = Router();

const isAdmin = [authenticate, requireRole('admin')];

router.get('/stats', ...isAdmin, getAdminStats);
router.get('/users', ...isAdmin, getAdminUsers);
router.get('/parking', ...isAdmin, getAdminParking);
router.get('/reports', ...isAdmin, getAdminReports);
router.patch('/reports/:id', ...isAdmin, updateReportStatus);
router.get('/reviews', ...isAdmin, getAdminReviews);
router.patch('/reviews/:id', ...isAdmin, moderateReview);

export default router;
