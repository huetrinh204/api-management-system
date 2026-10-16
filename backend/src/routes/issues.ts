import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  listAllIssues,
  getIssue,
  updateIssue,
  updateIssueStatus,
} from '../controllers/issueController';
import {
  getCommentsByIssue,
  createCommentOnIssue,
} from '../controllers/commentController';

const router = Router();

router.use(authenticate);

router.get('/', listAllIssues);
router.get('/:issueId', getIssue);
router.put('/:issueId', updateIssue);
router.patch('/:issueId/status', updateIssueStatus);
router.get('/:issueId/comments', getCommentsByIssue);
router.post('/:issueId/comments', createCommentOnIssue);

export default router;
