import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

// GET /api/profile - Get current user profile
router.get('/', profileController.getProfile);

// PUT /api/profile - Update profile (name, avatar_url)
router.put('/', profileController.updateProfile);

// POST /api/profile/change-password - Change password
router.post('/change-password', profileController.changePassword);

export default router;
