import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  getOperatorParking, createOperatorParking,
  updateOperatorParking, deleteOperatorParking,
} from '../controllers/operator.controller';

const router = Router();

const isOperator = [authenticate, requireRole('operator', 'admin')];

router.get('/parking', ...isOperator, getOperatorParking);
router.post('/parking', ...isOperator, createOperatorParking);
router.patch('/parking/:id', ...isOperator, updateOperatorParking);
router.delete('/parking/:id', ...isOperator, deleteOperatorParking);

export default router;
