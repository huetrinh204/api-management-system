import { ApiDoc, Comment, Issue, User } from '../models';

const includeAuthor = [{ model: User, as: 'author', attributes: ['id', 'name', 'role'] }];

export async function getCommentsByApiDoc(apiDocId: number) {
  const doc = await ApiDoc.findByPk(apiDocId);
  if (!doc) throw { status: 404, message: 'Tài liệu API không tồn tại' };
  return Comment.findAll({
    where: { api_doc_id: apiDocId },
    include: includeAuthor,
    order: [['createdAt', 'ASC']],
  });
}

export async function createCommentOnApiDoc(apiDocId: number, content: string, userId: number) {
  const doc = await ApiDoc.findByPk(apiDocId);
  if (!doc) throw { status: 404, message: 'Tài liệu API không tồn tại' };
  if (!content?.trim()) throw { status: 422, message: 'Nội dung bình luận không được để trống' };
  const comment = await Comment.create({ content: content.trim(), user_id: userId, api_doc_id: apiDocId, issue_id: null });
  // Reload with author info
  return Comment.findByPk(comment.id, { include: includeAuthor });
}

export async function getCommentsByIssue(issueId: number) {
  const issue = await Issue.findByPk(issueId);
  if (!issue) throw { status: 404, message: 'Issue không tồn tại' };
  return Comment.findAll({
    where: { issue_id: issueId },
    include: includeAuthor,
    order: [['createdAt', 'ASC']],
  });
}

export async function createCommentOnIssue(issueId: number, content: string, userId: number) {
  const issue = await Issue.findByPk(issueId);
  if (!issue) throw { status: 404, message: 'Issue không tồn tại' };
  if (!content?.trim()) throw { status: 422, message: 'Nội dung bình luận không được để trống' };
  const comment = await Comment.create({ content: content.trim(), user_id: userId, api_doc_id: null, issue_id: issueId });
  // Reload with author info
  return Comment.findByPk(comment.id, { include: includeAuthor });
}

export async function deleteComment(commentId: number, userId: number) {
  const comment = await Comment.findByPk(commentId);
  if (!comment) throw { status: 404, message: 'Bình luận không tồn tại' };
  if (comment.user_id !== userId) throw { status: 403, message: 'Chỉ chủ sở hữu mới có thể xóa bình luận' };
  await comment.destroy();
}
