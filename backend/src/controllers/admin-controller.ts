import { clerkClient } from "@clerk/express";
import type { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await clerkClient.users.getUserList({ limit: 500});
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, newRole } = req.body;
        if (!userId || !newRole) {
            res.status(400).json({ error: 'userId and newRole are required' });
            return;
        }
        await clerkClient.users.updateUser(userId, {
            publicMetadata: { role: newRole }
        });
        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
}