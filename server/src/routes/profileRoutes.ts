import { Router } from 'express';
import { getProfileData, updateProfileData } from '../controllers/profileController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getProfileData);
router.put('/', authenticate, updateProfileData);

export default router;