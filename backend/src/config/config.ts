import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    dbUrl: string;
    frontendUrl: string;
} 

const config: Config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    dbUrl: process.env.DATABASE_URL || '',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}

export default config;