import { Op } from 'sequelize';
import { ApiDoc, User } from '../models';
import { HttpMethod, ApiDocStatus } from '../models/ApiDoc';

const VALID_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const VALID_STATUSES: ApiDocStatus[] = ['Draft', 'Active', 'Deprecated'];

interface ApiDocFilters {
  search?: string;
  method?: string;
  status?: string;
}

interface ApiDocInput {
  name?: string;
  method?: string;
  endpoint?: string;
  description?: string;
  request_sample?: string;
  response_sample?: string;
  status?: string;
}

function validateInput(data: ApiDocInput, requireAll = true) {
  const errors: string[] = [];

  if (requireAll || data.name !== undefined) {
    if (!data.name || !data.name.trim()) errors.push('name là bắt buộc');
  }
  if (requireAll || data.method !== undefined) {
    if (!data.method) errors.push('method là bắt buộc');
    else if (!VALID_METHODS.includes(data.method as HttpMethod))
      errors.push(`method phải là một trong: ${VALID_METHODS.join(', ')}`);
  }
  if (requireAll || data.endpoint !== undefined) {
    if (!data.endpoint || !data.endpoint.trim()) errors.push('endpoint là bắt buộc');
  }
  if (requireAll || data.description !== undefined) {
    if (!data.description || !data.description.trim()) errors.push('description là bắt buộc');
  }
  if (data.status !== undefined) {
    if (!VALID_STATUSES.includes(data.status as ApiDocStatus))
      errors.push(`status phải là một trong: ${VALID_STATUSES.join(', ')}`);
  }
  return errors;
}

export async function getApiDocs(filters: ApiDocFilters) {
  const where: Record<string, unknown> = {};

  if (filters.search) {
    where[Op.or as unknown as string] = [
      { name: { [Op.like]: `%${filters.search}%` } },
      { endpoint: { [Op.like]: `%${filters.search}%` } },
    ];
  }
  if (filters.method) {
    if (!VALID_METHODS.includes(filters.method as HttpMethod))
      throw { status: 422, message: `method không hợp lệ` };
    where.method = filters.method;
  }
  if (filters.status) {
    if (!VALID_STATUSES.includes(filters.status as ApiDocStatus))
      throw { status: 422, message: `status không hợp lệ` };
    where.status = filters.status;
  }

  return ApiDoc.findAll({
    where,
    include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'role'] }],
    order: [['updatedAt', 'DESC']],
  });
}

export async function getApiDocById(id: number) {
  const doc = await ApiDoc.findByPk(id, {
    include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'role'] }],
  });
  if (!doc) throw { status: 404, message: 'Tài liệu API không tồn tại' };
  return doc;
}

export async function createApiDoc(data: ApiDocInput, userId: number) {
  const errors = validateInput(data, true);
  if (errors.length) throw { status: 422, message: errors.join('; ') };

  return ApiDoc.create({
    name: data.name!.trim(),
    method: data.method as HttpMethod,
    endpoint: data.endpoint!.trim(),
    description: data.description!.trim(),
    request_sample: data.request_sample || null,
    response_sample: data.response_sample || null,
    status: (data.status as ApiDocStatus) || 'Draft',
    created_by: userId,
  });
}

export async function updateApiDoc(id: number, data: ApiDocInput) {
  const doc = await ApiDoc.findByPk(id);
  if (!doc) throw { status: 404, message: 'Tài liệu API không tồn tại' };

  const errors = validateInput(data, false);
  if (errors.length) throw { status: 422, message: errors.join('; ') };

  // Trim các trường string nếu có
  if (data.name !== undefined) doc.name = data.name.trim();
  if (data.method !== undefined) doc.method = data.method as HttpMethod;
  if (data.endpoint !== undefined) doc.endpoint = data.endpoint.trim();
  if (data.description !== undefined) doc.description = data.description.trim();
  if (data.request_sample !== undefined) doc.request_sample = data.request_sample || null;
  if (data.response_sample !== undefined) doc.response_sample = data.response_sample || null;
  if (data.status !== undefined) doc.status = data.status as ApiDocStatus;

  await doc.save();
  return doc.reload({
    include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'role'] }],
  });
}

export async function deleteApiDoc(id: number) {
  const doc = await ApiDoc.findByPk(id);
  if (!doc) throw { status: 404, message: 'Tài liệu API không tồn tại' };
  await doc.destroy(); // paranoid: true → chỉ set deletedAt
}
