import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from '../models';
import type { UserRole } from '../models/User';

const BUSINESS_ROLES: UserRole[] = ['BA', 'Backend Developer', 'Frontend Developer', 'Tester'];

export interface UserFilters {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
}

// Get list of users with filters
export async function getUsers(filters: UserFilters = {}) {
  const where: any = {};

  if (filters.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${filters.search}%` } },
      { email: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.is_active !== undefined) {
    where.is_active = filters.is_active;
  }

  const users = await User.findAll({
    where,
    attributes: ['id', 'name', 'email', 'role', 'is_active', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']],
  });

  return users;
}

// Get user by ID
export async function getUserById(id: number) {
  const user = await User.findByPk(id, {
    attributes: ['id', 'name', 'email', 'role', 'is_active', 'createdAt', 'updatedAt'],
  });

  if (!user) {
    const error: any = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

// Create new user (Admin only, cannot create another Admin)
export async function createUser(data: CreateUserData) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    const error: any = new Error('Email không đúng định dạng');
    error.statusCode = 422;
    throw error;
  }

  // Normalize email
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check if email already exists
  const existingUser = await User.findOne({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error: any = new Error('Email đã được sử dụng');
    error.statusCode = 422;
    throw error;
  }

  // Only allow creating business roles (not Admin)
  if (!BUSINESS_ROLES.includes(data.role)) {
    const error: any = new Error('Không thể tạo tài khoản với vai trò này. Chỉ được tạo: BA, Backend Developer, Frontend Developer, Tester');
    error.statusCode = 422;
    throw error;
  }

  // Generate default password if not provided
  const defaultPassword = data.password || 'Welcome@123';
  const password_hash = await bcrypt.hash(defaultPassword, 10);

  const user = await User.create({
    name: data.name.trim(),
    email: normalizedEmail,
    password_hash,
    role: data.role,
    is_active: true,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    temporaryPassword: defaultPassword, // Return temporary password (only on creation)
  };
}

// Update user
export async function updateUser(id: number, data: UpdateUserData) {
  const user = await User.findByPk(id);

  if (!user) {
    const error: any = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  // Cannot update Admin accounts
  if (user.role === 'Admin') {
    const error: any = new Error('Không thể cập nhật thông tin tài khoản Admin');
    error.statusCode = 403;
    throw error;
  }

  // If email is being changed, validate and check uniqueness
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      const error: any = new Error('Email không đúng định dạng');
      error.statusCode = 422;
      throw error;
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    if (normalizedEmail !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email: normalizedEmail,
          id: { [Op.ne]: id },
        },
      });

      if (existingUser) {
        const error: any = new Error('Email đã được sử dụng');
        error.statusCode = 422;
        throw error;
      }

      user.email = normalizedEmail;
    }
  }

  // If role is being changed, only allow business roles
  if (data.role) {
    if (!BUSINESS_ROLES.includes(data.role)) {
      const error: any = new Error('Không thể gán vai trò này. Chỉ được gán: BA, Backend Developer, Frontend Developer, Tester');
      error.statusCode = 422;
      throw error;
    }
    user.role = data.role;
  }

  // Update other fields
  if (data.name !== undefined) user.name = data.name.trim();

  await user.save();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Toggle user active status (lock/unlock account)
export async function toggleUserStatus(id: number) {
  const user = await User.findByPk(id);

  if (!user) {
    const error: any = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  // Cannot lock/unlock Admin accounts
  if (user.role === 'Admin') {
    const error: any = new Error('Không thể khóa/mở khóa tài khoản Admin');
    error.statusCode = 403;
    throw error;
  }

  user.is_active = !user.is_active;
  await user.save();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    message: user.is_active ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
  };
}
