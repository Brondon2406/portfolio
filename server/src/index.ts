import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuration ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chemin de base pour les fichiers statiques (adapté pour Render)
const staticBasePath = path.join(__dirname, '../../dist');

// Chargement des variables d'environnement
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Serve static files - Chemins corrigés pour Render
app.use(express.static(path.join(staticBasePath, 'client'), staticOptions));
app.use('/admin', express.static(path.join(staticBasePath, 'admin'), staticOptions));

// Chemin des données
const dataPath = path.join(__dirname, '../../data/profileData.json');

// Middleware d'authentification
const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        
        jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
            if (err) return res.sendStatus(403);
            (req as any).user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// API Routes
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
    
    if (username === process.env.ADMIN_USERNAME && await bcrypt.compare(password, process.env.ADMIN_PASSWORD!)) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: '1h' });
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

// Gestion des projets
app.post('/api/projects', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        data.projects = data.projects || [];
        data.projects.push(req.body);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json({ message: 'Project added', projects: data.projects });
    } catch (error) {
        console.error('Add project error:', error);
        res.status(500).json({ error: 'Failed to add project' });
    }
});

app.delete('/api/projects/:index', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const index = parseInt(req.params.index);
        
        if (!data.projects || index < 0 || index >= data.projects.length) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        data.projects.splice(index, 1);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json({ message: 'Project deleted', projects: data.projects });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Gestion des compétences
app.post('/api/skills', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        data.skills = data.skills || [];
        data.skills.push(req.body);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json({ message: 'Skill added', skills: data.skills });
    } catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({ error: 'Failed to add skill' });
    }
});

app.delete('/api/skills/:index', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const index = parseInt(req.params.index);
        
        if (!data.skills || index < 0 || index >= data.skills.length) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        
        data.skills.splice(index, 1);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json({ message: 'Skill deleted', skills: data.skills });
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ error: 'Failed to delete skill' });
    }
});

// Routes client - Chemins corrigés
app.get(['/', '/about', '/projects', '/skills', '/contact'], (req, res) => {
    res.sendFile(path.join(staticBasePath, 'client', 'index.html'));
});

// Route admin - Chemin corrigé
app.get('/admin*', (req, res) => {
    res.sendFile(path.join(staticBasePath, 'admin', 'index.html'));
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(staticBasePath, 'client', 'index.html'));
});

// Gestion des erreurs 500
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    
    // Avertissement pour le mot de passe admin
    if (process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD.startsWith('$2a$')) {
        const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
        console.warn('\n⚠️  ADMIN_PASSWORD should be hashed in production:');
        console.warn(`ADMIN_PASSWORD=${hashed}\n`);
    }
});