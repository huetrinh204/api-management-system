import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profileService';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.getProfile(req.user!.id);
    return res.json(profile);
  } catch (err) {
    return next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.updateProfile(req.user!.id, req.body);
    return res.json(profile);
  } catch (err) {
    return next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(422).json({ error: 'Old password and new password are required' });
    }

    const result = await profileService.changePassword(req.user!.id, oldPassword, newPassword);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}
