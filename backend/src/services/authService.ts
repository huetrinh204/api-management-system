import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';

export async function loginService(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    throw { status: 401, message: 'Email hoặc mật khẩu không đúng' };
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw { status: 401, message: 'Email hoặc mật khẩu không đúng' };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET chưa được cấu hình');

  const signOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'],
  };
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    signOptions
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}
