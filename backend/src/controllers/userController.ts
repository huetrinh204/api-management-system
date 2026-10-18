import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, role, is_active } = req.query;
    const users = await userService.getUsers({
      search: search as string,
      role: role as any,
      is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
    });
    return res.json(users);
  } catch (err) {
    return next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (err) {
    return next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateUser(Number(req.params.id), req.body);
    return res.json(user);
  } catch (err) {
    return next(err);
  }
}

export async function toggleUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.toggleUserStatus(Number(req.params.id));
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}
