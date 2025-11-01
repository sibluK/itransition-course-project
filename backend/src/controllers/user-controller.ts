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

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search } = req.query;

        const users = await clerkClient.users.getUserList({
            limit: 100,
            ...(search && { query: search as string }),
        });

        res.status(200).json(users.data.map(user => ({
            id: user.id,
            name: user.fullName,
            email: user.emailAddresses[0]?.emailAddress || "",
            imageUrl: user.imageUrl || "",
        })))
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}