import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

// All user management routes require authentication AND Admin role
router.use(authenticate);
router.use(requireAdmin);

// GET /api/users - List all users
router.get('/', userController.listUsers);

// POST /api/users - Create new user (business roles only)
router.post('/', userController.createUser);

// GET /api/users/:id - Get user detail
router.get('/:id', userController.getUser);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// PATCH /api/users/:id/status - Toggle user active status (lock/unlock)
router.patch('/:id/status', userController.toggleUserStatus);

export default router;
