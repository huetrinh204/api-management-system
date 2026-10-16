import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/requireRole';
import {
  listApiDocs,
  getApiDoc,
  createApiDoc,
  updateApiDoc,
  deleteApiDoc,
} from '../controllers/apiDocController';
import {
  listIssuesByApiDoc,
  createIssue,
} from '../controllers/issueController';
import {
  getCommentsByApiDoc,
  createCommentOnApiDoc,
} from '../controllers/commentController';

const router = Router();

router.use(authenticate);

router.get('/', listApiDocs);
router.get('/:id', getApiDoc);
router.post('/', requireRole('BA', 'Backend Developer'), createApiDoc);
router.put('/:id', requireRole('BA', 'Backend Developer'), updateApiDoc);
router.delete('/:id', requireRole('BA'), deleteApiDoc);

// Comments của API Doc
router.get('/:id/comments', getCommentsByApiDoc);
router.post('/:id/comments', createCommentOnApiDoc);

// Issues của API Doc
router.get('/:id/issues', listIssuesByApiDoc);
router.post('/:id/issues', createIssue);

export default router;
