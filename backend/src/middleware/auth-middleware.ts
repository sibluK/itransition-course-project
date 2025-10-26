import { getAuth, clerkClient } from "@clerk/express"
import type { Request, Response, NextFunction } from 'express';

export const requireRole = (requiredRole: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId } = getAuth(req);

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const user = await clerkClient.users.getUser(userId);
            const userRole = user.publicMetadata.role;

            if (userRole !== requiredRole) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }

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