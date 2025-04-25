import express = require('express');
import cors = require('cors');
import morgan = require('morgan');
import jwt = require('jsonwebtoken');
import bcrypt = require('bcryptjs');
import fs = require('fs');
import path = require('path');

// Déclaration des types pour les imports CommonJS
declare const __dirname: string;

// Interface pour les données de profil
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

// Initialisation de l'application
const app: express.Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Configuration des fichiers statiques
const staticOptions: express.StaticOptions = {
    dotfiles: 'ignore',
    etag: true,
    extensions: ['html', 'css', 'js'],
    index: false,
    maxAge: '1d',
    redirect: false
};

// Chemins absolus
const clientPath: string = path.join(__dirname, '../client');
const adminPath: string = path.join(__dirname, '../admin');

app.use(express.static(clientPath, staticOptions));
app.use('/admin', express.static(adminPath, staticOptions));

// Chemin des données
const dataPath: string = path.join(__dirname, '../data/profileData.json');

// Middleware d'authentification
const authenticateJWT = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        
        jwt.verify(token, process.env.JWT_SECRET || '', (err: jwt.VerifyErrors | null, user: object | undefined) => {
            if (err) return res.sendStatus(403);
            (req as any).user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// API Routes
app.get('/api/profile', (req: express.Request, res: express.Response) => {
    try {
        const data: ProfileData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        res.json(data);
    } catch (error) {
        console.error('Error reading profile:', error);
        res.status(500).json({ error: 'Failed to load profile data' });
    }
});

app.post('/api/admin/login', async (req: express.Request, res: express.Response) => {
    const { username, password }: { username: string; password: string } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && await bcrypt.compare(password, process.env.ADMIN_PASSWORD || '')) {
        const token: string = jwt.sign({ username }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ error: 'Invalid credentials' });
});

// ... (toutes les autres routes avec le même pattern de typage)

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    
    if (process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD.startsWith('$2a$')) {
        const hashed: string = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
        console.warn('\n⚠️ ADMIN_PASSWORD should be hashed in production:');
        console.warn(`ADMIN_PASSWORD=${hashed}\n`);
    }
});