import express = require('express');
import cors = require('cors');
import morgan = require('morgan');
import jwt = require('jsonwebtoken');
import bcrypt = require('bcryptjs');
import fs = require('fs');
import path = require('path');

// Interface des données
interface ProfileData {
  name: string;
  title: string;
  about: string;
  email: string;
  phone: string;
  location: string;
  projects: Project[];
  skills: Skill[];
}

interface Project {
  title: string;
  description: string;
  link: string;
}

interface Skill {
  name: string;
  level: number;
}

// Initialisation
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Configuration des fichiers statiques
const staticOptions = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['html', 'css', 'js'],
  index: false,
  maxAge: '1d',
  redirect: false
};

const clientPath = path.join(__dirname, '../../client/public');
const adminPath = path.join(__dirname, '../../admin/public');
const dataPath = path.join(__dirname, '../../data/profileData.json');

// Middleware d'authentification
const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || '', (err: any) => {
      if (err) return res.sendStatus(403);
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Routes API
app.get('/api/profile', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('Error reading profile:', error);
    res.status(500).json({ error: 'Failed to load profile data' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USERNAME && await bcrypt.compare(password, process.env.ADMIN_PASSWORD || '')) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// Routes protégées
app.put('/api/profile', authenticateJWT, (req, res) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Routes fichiers statiques
app.use(express.static(clientPath, staticOptions));
app.use('/admin', express.static(adminPath, staticOptions));

// Routes client
app.get(['/', '/about', '/projects', '/skills', '/contact'], (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Route admin
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(adminPath, 'index.html'));
});

// Gestion des erreurs
app.use((req, res) => {
  res.status(404).sendFile(path.join(clientPath, 'index.html'));
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  if (process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD.startsWith('$2a$')) {
    const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    console.warn('\n⚠️ ADMIN_PASSWORD should be hashed in production:');
    console.warn(`ADMIN_PASSWORD=${hashed}\n`);
  }
});