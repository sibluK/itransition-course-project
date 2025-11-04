import express from 'express';
import userRoutes from './routes/user-routes.js';
import adminRoutes from './routes/admin-routes.js';
import inventoryRoutes from './routes/inventory-routes.js';
import categoryRoutes from './routes/category-routes.js';
import tagRoutes from './routes/tag-routes.js';
import accessRoutes from './routes/access-routes.js';
import discussionRoutes from './routes/discussion-routes.js';
import searchRoutes from './routes/search-routes.js';
import fieldRoutes from './routes/fields-routes.js';
import cors from 'cors'
import { corsOptions } from './config/cors.js';
import { clerkMiddleware } from '@clerk/express';

const app = express();

app.use(clerkMiddleware());
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventories', inventoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/fields', fieldRoutes);

export default app;