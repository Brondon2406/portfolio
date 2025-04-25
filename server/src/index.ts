import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import profileRoutes from './routes/profileRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import { notFoundHandler } from './middleware/notFoundMiddleware';
import { config } from './config';

const app = express();
const __dirname = path.resolve();

// Configuration
app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use(express.static(path.join(__dirname, '../../client/public')));
app.use('/admin', express.static(path.join(__dirname, '../../admin/public')));
app.use('/assets', express.static(path.join(__dirname, '../../public/assets')));

// Routes API
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// Démarrage
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});