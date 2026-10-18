import { User } from '../models';
import bcrypt from 'bcryptjs';

export async function getProfile(userId: number) {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'role', 'avatar_url', 'createdAt', 'updatedAt'],
  });
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
}

export async function updateProfile(userId: number, data: { name?: string; avatar_url?: string }) {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  if (data.name !== undefined) {
    if (!data.name.trim()) throw { status: 422, message: 'Name cannot be empty' };
    user.name = data.name.trim();
  }

  if (data.avatar_url !== undefined) {
    user.avatar_url = data.avatar_url || null;
  }

  await user.save();
  return User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'role', 'avatar_url', 'createdAt', 'updatedAt'],
  });
}

export async function changePassword(userId: number, oldPassword: string, newPassword: string) {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: 'User not found' };

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isValid) throw { status: 401, message: 'Current password is incorrect' };

  // Validate new password
  if (!newPassword || newPassword.length < 8) {
    throw { status: 422, message: 'New password must be at least 8 characters long' };
  }

  // Hash and save new password
  user.password_hash = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: 'Password changed successfully' };
}
