import { getAuth, clerkClient } from "@clerk/express"
import type { Request, Response, NextFunction } from 'express';

export const requireRole = (requiredRole: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log('requireRole middleware hit');
            console.log('Headers:', req.headers);
            const { userId } = getAuth(req);

            console.log('getAuth result:', getAuth(req));

            if (!userId) {
                console.log('No userId found - returning 401');
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            console.log('Fetching user from Clerk:', userId);
            const user = await clerkClient.users.getUser(userId);
            console.log('User role:', user.publicMetadata.role);
            const userRole = user.publicMetadata.role;

            if (userRole !== requiredRole) {
                console.log(`Role mismatch: required ${requiredRole}, got ${userRole}`);
                res.status(403).json({ error: 'Forbidden' });
                return;
            }

            console.log('Auth successful, proceeding');
            next();
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export const checkStatus = () => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId } = getAuth(req);
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const user = await clerkClient.users.getUser(userId);
            const isBanned = user.banned;
            if (isBanned) {
                res.status(403).json({ error: 'User is blocked' });
                return;
            }
            next();
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}