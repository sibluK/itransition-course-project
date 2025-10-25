import express from 'express';
import userRoutes from './routes/user-routes.js';
import adminRoutes from './routes/admin-routes.js';
import cors from 'cors'
import { corsOptions } from './config/cors.js';
import { clerkMiddleware } from '@clerk/express';

const app = express();

app.use(clerkMiddleware());
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes);

export default app;