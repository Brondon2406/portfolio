import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files from React/Vite client
app.use(express.static(path.join(__dirname, 'client', 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin', 'public')));

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  next();
});

// API Routes
// ... (conservez toutes vos routes API existantes ici)

// Client routes
app.get(['/', '/about', '/projects', '/skills', '/contact'], (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'public', 'index.html'));
});

// Admin route
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'public', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'client', 'public', 'index.html'));
  } else if (req.accepts('json')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.status(404).send('Not found');
  }
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
  
  // Hasher le mot de passe admin si nécessaire
  if (!process.env.ADMIN_PASSWORD?.startsWith('$2a$')) {
    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD!, 10);
    console.warn('\nATTENTION: Mettez à jour .env avec ce hash:');
    console.warn(`ADMIN_PASSWORD=${hashedPassword}\n`);
  }
});