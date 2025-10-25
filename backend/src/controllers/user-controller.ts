import type { Request, Response } from 'express';
import { clerkClient, getAuth } from "@clerk/express";

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        const user = await clerkClient.users.getUser(userId!);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
}