import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favorites.controller';

const router = Router();

router.get('/', authenticate, getFavorites);
router.post('/:parkingId', authenticate, addFavorite);
router.delete('/:parkingId', authenticate, removeFavorite);

export default router;
