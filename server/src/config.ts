import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
    PORT: number;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD: string;
    JWT_SECRET: string;
}

const config: Config = {
    PORT: parseInt(process.env.PORT || '3000'),
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'securepassword',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_here'
};

export default config;