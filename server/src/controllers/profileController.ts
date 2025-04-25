import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(__dirname, '../../data/profileData.json');

export const getProfileData = (req: Request, res: Response) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error reading profile data' });
  }
};

export const updateProfileData = (req: Request, res: Response) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile data' });
  }
};