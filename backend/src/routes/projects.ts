import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/projects - List all projects (all roles)
router.get('/', projectController.listProjects);

// POST /api/projects - Create new project (BA, Backend Developer only)
router.post(
  '/',
  requireRole('BA', 'Backend Developer'),
  projectController.createProject
);

// GET /api/projects/:id - Get project detail (all roles)
router.get('/:id', projectController.getProject);

// PUT /api/projects/:id - Update project (BA, Backend Developer only)
router.put(
  '/:id',
  requireRole('BA', 'Backend Developer'),
  projectController.updateProject
);

// DELETE /api/projects/:id - Delete project (BA only)
router.delete(
  '/:id',
  requireRole('BA'),
  projectController.deleteProject
);

// GET /api/projects/:id/api-docs - Get API docs of project (all roles)
router.get('/:id/api-docs', projectController.listApiDocsByProject);

export default router;
