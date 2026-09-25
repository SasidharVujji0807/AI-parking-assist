import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getHistory, saveHistory, deleteHistory } from '../controllers/history.controller';

const router = Router();

router.get('/', authenticate, getHistory);
router.post('/', authenticate, saveHistory);
router.delete('/:id', authenticate, deleteHistory);

export default router;
