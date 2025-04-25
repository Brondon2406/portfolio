import { Router } from 'express';
import { login, updateCredentials } from '../controllers/adminController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.put('/credentials', authenticate, updateCredentials);

export default router;