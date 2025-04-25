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

// Configuration des chemins pour Render
const staticOptions = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['html', 'css', 'js', 'json'],
  index: ['index.html'],
  maxAge: '1d',
  redirect: false
};

// Serve static files
app.use(express.static(path.join(__dirname, 'dist', 'client'), staticOptions));
app.use('/admin', express.static(path.join(__dirname, 'dist', 'admin'), staticOptions));

// Chemin vers le fichier de données
const dataPath = path.join(__dirname, '..', 'data', 'profileData.json');

// Middleware d'authentification
const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        
        jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
            if (err) {
                return res.sendStatus(403);
            }
            
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
        console.error('Error reading profile data:', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des données' });
    }
});

// Authentification admin
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        if (username === process.env.ADMIN_USERNAME && await bcrypt.compare(password, process.env.ADMIN_PASSWORD!)) {
            const token = jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: '1h' });
            return res.json({ token });
        }
        res.status(401).json({ error: 'Identifiants incorrects' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Routes protégées
app.put('/api/profile', authenticateJWT, (req, res) => {
    try {
        const newData = req.body;
        fs.writeFileSync(dataPath, JSON.stringify(newData, null, 2));
        res.json({ message: 'Profil mis à jour avec succès' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
});

// Gestion des projets
app.post('/api/projects', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const newProject = req.body;
        
        data.projects = data.projects || [];
        data.projects.push(newProject);
        
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json({ message: 'Projet ajouté avec succès', projects: data.projects });
    } catch (error) {
        console.error('Add project error:', error);
        res.status(500).json({ error: "Erreur lors de l'ajout du projet" });
    }
});

app.delete('/api/projects/:index', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const index = parseInt(req.params.index);
        
        if (!data.projects || index < 0 || index >= data.projects.length) {
            return res.status(404).json({ error: 'Projet non trouvé' });
        }
        
        data.projects.splice(index, 1);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json({ message: 'Projet supprimé avec succès', projects: data.projects });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
    }
});

// Gestion des compétences
app.post('/api/skills', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const newSkill = req.body;
        
        data.skills = data.skills || [];
        data.skills.push(newSkill);
        
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json({ message: 'Compétence ajoutée avec succès', skills: data.skills });
    } catch (error) {
        console.error('Add skill error:', error);
        res.status(500).json({ error: "Erreur lors de l'ajout de la compétence" });
    }
});

app.delete('/api/skills/:index', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const index = parseInt(req.params.index);
        
        if (!data.skills || index < 0 || index >= data.skills.length) {
            return res.status(404).json({ error: 'Compétence non trouvée' });
        }
        
        data.skills.splice(index, 1);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json({ message: 'Compétence supprimée avec succès', skills: data.skills });
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la compétence' });
    }
});

// Client routes
app.get(['/', '/about', '/projects', '/skills', '/contact'], (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'client', 'index.html'));
});

// Admin route
app.get('/admin*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'admin', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'dist', 'client', 'index.html'));
    } else if (req.accepts('json')) {
        res.status(404).json({ error: 'Not found' });
    } else {
        res.status(404).type('txt').send('Not found');
    }
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err.stack);
    res.status(500).send('Internal Server Error');
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    
    // Hash du mot de passe admin si nécessaire
    if (process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD.startsWith('$2a$')) {
        const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
        console.warn('\n⚠️  ADMIN_PASSWORD should be hashed in production:');
        console.warn(`ADMIN_PASSWORD=${hashedPassword}\n`);
    }
});