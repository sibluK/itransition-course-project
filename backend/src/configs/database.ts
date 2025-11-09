import { drizzle } from 'drizzle-orm/neon-http';
import config from './config.js';

const db = drizzle(config.dbUrl);

export default db;