import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { deleteComment } from '../controllers/commentController';

const router = Router();

router.use(authenticate);

router.delete('/:commentId', deleteComment);

export default router;
