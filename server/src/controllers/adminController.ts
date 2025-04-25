import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  if (username === config.adminUsername && password === config.adminPassword) {
    const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

export const updateCredentials = (req: Request, res: Response) => {
  // Implementation to update admin credentials
  res.json({ message: 'Credentials updated successfully' });
};