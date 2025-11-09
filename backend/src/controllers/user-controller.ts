import type { Request, Response } from 'express';
import { clerkClient, getAuth } from "@clerk/express";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search } = req.query;

        const users = await clerkClient.users.getUserList({
            limit: 5,
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
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}