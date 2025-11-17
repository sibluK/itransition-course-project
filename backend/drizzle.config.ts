import { defineConfig } from 'drizzle-kit';
import config from './src/configs/config.ts';

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: config.dbUrl,
    },
});
