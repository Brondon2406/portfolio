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

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Chemin vers le fichier de données
const dataPath = path.join(__dirname, '../../data/profileData.json');

// Middleware d'authentification
const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        
        jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
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

// Routes publiques
app.get('/api/profile', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la lecture des données' });
    }
});

// Authentification admin
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && await bcrypt.compare(password, process.env.ADMIN_PASSWORD!)) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET!, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Identifiants incorrects' });
    }
});

// Routes protégées
app.put('/api/profile', authenticateJWT, (req, res) => {
    try {
        const newData = req.body;
        fs.writeFileSync(dataPath, JSON.stringify(newData, null, 2));
        res.json({ message: 'Profil mis à jour avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
});

// Gestion des projets
app.post('/api/projects', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const newProject = req.body;
        
        if (!data.projects) {
            data.projects = [];
        }
        
        data.projects.push(newProject);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        
        res.json({ message: 'Projet ajouté avec succès', projects: data.projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du projet' });
    }
});

app.delete('/api/projects/:index', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const index = parseInt(req.params.index);
        
        if (data.projects && index >= 0 && index < data.projects.length) {
            data.projects.splice(index, 1);
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
            res.json({ message: 'Projet supprimé avec succès', projects: data.projects });
        } else {
            res.status(404).json({ error: 'Projet non trouvé' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
    }
});

// Gestion des compétences
app.post('/api/skills', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const newSkill = req.body;
        
        if (!data.skills) {
            data.skills = [];
        }
        
        data.skills.push(newSkill);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        
        res.json({ message: 'Compétence ajoutée avec succès', skills: data.skills });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la compétence' });
    }
});

app.delete('/api/skills/:index', authenticateJWT, (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const index = parseInt(req.params.index);
        
        if (data.skills && index >= 0 && index < data.skills.length) {
            data.skills.splice(index, 1);
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
            res.json({ message: 'Compétence supprimée avec succès', skills: data.skills });
        } else {
            res.status(404).json({ error: 'Compétence non trouvée' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la compétence' });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
    
    // Hasher le mot de passe admin au premier démarrage si nécessaire
    if (!process.env.ADMIN_PASSWORD?.startsWith('$2a$')) {
        const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD!, 10);
        console.warn('\nATTENTION: Le mot de passe admin doit être hashé dans le fichier .env:');
        console.warn(`ADMIN_PASSWORD=${hashedPassword}\n`);
    }
});