import { ApiDoc, Issue, User } from '../models';
import { IssuePriority, IssueStatus } from '../models/Issue';
import { UserRole } from '../models/User';

const VALID_PRIORITIES: IssuePriority[] = ['Low', 'Medium', 'High'];
const VALID_STATUSES: IssueStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed', 'Reopened'];

// State machine: [fromStatus] -> { toStatus: rolesAllowed[] }
const TRANSITIONS: Record<IssueStatus, Partial<Record<IssueStatus, UserRole[]>>> = {
  'Open': {
    'In Progress': ['BA', 'Backend Developer', 'Frontend Developer', 'Tester'],
  },
  'In Progress': {
    'Resolved': ['BA', 'Backend Developer', 'Frontend Developer', 'Tester'],
  },
  'Resolved': {
    'Closed': ['BA', 'Tester'],
    'Reopened': ['Tester'],
  },
  'Reopened': {
    'In Progress': ['BA', 'Backend Developer', 'Frontend Developer', 'Tester'],
  },
  'Closed': {},
};

const includeUsers = [
  { model: User, as: 'creator', attributes: ['id', 'name', 'role'] },
  { model: User, as: 'assignee', attributes: ['id', 'name', 'role'] },
];

export async function getAllIssues(filters: { status?: string; priority?: string }) {
  const where: Record<string, unknown> = {};
  if (filters.status) {
    if (!VALID_STATUSES.includes(filters.status as IssueStatus))
      throw { status: 422, message: 'status không hợp lệ' };
    where.status = filters.status;
  }
  if (filters.priority) {
    if (!VALID_PRIORITIES.includes(filters.priority as IssuePriority))
      throw { status: 422, message: 'priority không hợp lệ' };
    where.priority = filters.priority;
  }
  return Issue.findAll({ where, include: includeUsers, order: [['createdAt', 'DESC']] });
}

export async function getIssuesByApiDoc(apiDocId: number, filters: { status?: string; priority?: string }) {
  // Cho phép xem issue của api_doc đã bị soft-delete
  const doc = await ApiDoc.findByPk(apiDocId, { paranoid: false });
  if (!doc) throw { status: 404, message: 'Tài liệu API không tồn tại' };

  const where: Record<string, unknown> = { api_doc_id: apiDocId };
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;

  return Issue.findAll({ where, include: includeUsers, order: [['createdAt', 'DESC']] });
}

export async function getIssueById(id: number) {
  const issue = await Issue.findByPk(id, { include: includeUsers });
  if (!issue) throw { status: 404, message: 'Issue không tồn tại' };
  return issue;
}

export async function createIssue(
  apiDocId: number,
  data: { title?: string; description?: string; priority?: string; assigned_to?: number },
  userId: number
) {
  // Không cho tạo issue cho API đã bị xóa mềm
  const doc = await ApiDoc.findByPk(apiDocId);
  if (!doc) throw { status: 404, message: 'Tài liệu API không tồn tại hoặc đã bị xóa' };

  const errors: string[] = [];
  if (!data.title?.trim()) errors.push('title là bắt buộc');
  if (!data.description?.trim()) errors.push('description là bắt buộc');
  if (!data.priority) errors.push('priority là bắt buộc');
  else if (!VALID_PRIORITIES.includes(data.priority as IssuePriority))
    errors.push(`priority phải là một trong: ${VALID_PRIORITIES.join(', ')}`);
  if (errors.length) throw { status: 422, message: errors.join('; ') };

  if (data.assigned_to) {
    const assignee = await User.findByPk(data.assigned_to);
    if (!assignee) throw { status: 422, message: 'assigned_to không tồn tại' };
  }

  return Issue.create({
    api_doc_id: apiDocId,
    title: data.title!.trim(),
    description: data.description!.trim(),
    priority: data.priority as IssuePriority,
    status: 'Open',
    created_by: userId,
    assigned_to: data.assigned_to || null,
  });
}

export async function updateIssue(
  issueId: number,
  data: { title?: string; description?: string; priority?: string; assigned_to?: number | null },
  userId: number,
  userRole: UserRole
) {
  const issue = await Issue.findByPk(issueId);
  if (!issue) throw { status: 404, message: 'Issue không tồn tại' };

  const isCreator = issue.created_by === userId;
  const isAssignee = issue.assigned_to === userId;
  const canEditContent = isCreator || isAssignee;
  const canEditAssignee = userRole === 'BA' || userRole === 'Backend Developer';

  // Kiểm tra quyền sửa nội dung
  const wantsContent = data.title !== undefined || data.description !== undefined || data.priority !== undefined;
  if (wantsContent && !canEditContent) {
    throw { status: 403, message: 'Chỉ người tạo hoặc người được giao mới có thể sửa tiêu đề, mô tả và priority' };
  }

  // Kiểm tra quyền cập nhật assigned_to
  if (data.assigned_to !== undefined && !canEditAssignee) {
    throw { status: 403, message: 'Chỉ BA hoặc Backend Developer mới có thể cập nhật người phụ trách' };
  }

  if (data.title !== undefined) {
    if (!data.title.trim()) throw { status: 422, message: 'title không được để trống' };
    issue.title = data.title.trim();
  }
  if (data.description !== undefined) {
    if (!data.description.trim()) throw { status: 422, message: 'description không được để trống' };
    issue.description = data.description.trim();
  }
  if (data.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(data.priority as IssuePriority))
      throw { status: 422, message: `priority phải là một trong: ${VALID_PRIORITIES.join(', ')}` };
    issue.priority = data.priority as IssuePriority;
  }
  if (data.assigned_to !== undefined) {
    if (data.assigned_to !== null) {
      const assignee = await User.findByPk(data.assigned_to);
      if (!assignee) throw { status: 422, message: 'assigned_to không tồn tại' };
    }
    issue.assigned_to = data.assigned_to;
  }

  await issue.save();
  return issue.reload({ include: includeUsers });
}

export async function updateIssueStatus(issueId: number, newStatus: string, userRole: UserRole) {
  const issue = await Issue.findByPk(issueId);
  if (!issue) throw { status: 404, message: 'Issue không tồn tại' };

  if (!VALID_STATUSES.includes(newStatus as IssueStatus))
    throw { status: 422, message: `status không hợp lệ` };

  const allowedTransitions = TRANSITIONS[issue.status];
  const allowedRoles = allowedTransitions[newStatus as IssueStatus];

  if (!allowedRoles) {
    throw { status: 422, message: `Không thể chuyển từ "${issue.status}" sang "${newStatus}"` };
  }
  if (!allowedRoles.includes(userRole)) {
    throw { status: 403, message: `Role "${userRole}" không được phép thực hiện chuyển trạng thái này` };
  }

  issue.status = newStatus as IssueStatus;
  await issue.save();
  return issue.reload({ include: includeUsers });
}
