import { clerkClient } from "@clerk/express";
import type { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, query: search, orderBy } = req.query;
        const users = await clerkClient.users.getUserList({ 
            limit: /*Number(limit) || 10*/ 500, 
            /*offset: (Number(page) - 1) * Number(limit), 
            query: search as string, 
            orderBy: orderBy as any*/
        });
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userIds, newRole } = req.body;
        if (!Array.isArray(userIds) || !newRole) {
            res.status(400).json({ error: 'userIds and newRole are required' });
            return;
        }
        await Promise.all(userIds.map(id => updateRole(id, newRole)));
        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
}

const updateRole = async (userId: string, role: string): Promise<void> => {
    const user = await clerkClient.users.getUser(userId);
    await clerkClient.users.updateUser(userId, {
        publicMetadata: { 
            ...user.publicMetadata,
            role: role
        }
    });
}

export const banUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds)) {
            res.status(400).json({ error: 'User IDs are required' });
            return;
        }
        await Promise.all(userIds.map(id => banSignleUser(id)));
        res.status(200).json({ message: 'Users blocked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to ban users' });
    }
}

const banSignleUser = async (id: string) => {
    await clerkClient.users.banUser(id);
}

export const unbanUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds)) {
            res.status(400).json({ error: 'User IDs are required' });
            return;
        }
        await Promise.all(userIds.map(id => unbanSingleUser(id)));
        res.status(200).json({ message: 'Users unblocked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to unblock users' });
    }
}

const unbanSingleUser = async (id: string) => {
    await clerkClient.users.unbanUser(id);
}

export const deleteUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds)) {
            res.status(400).json({ error: 'User IDs are required' });
            return;
        }
        await Promise.all(userIds.map(id => deleteSingleUser(id)));
        res.status(200).json({ message: 'Users deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete users' });
    }
}
const deleteSingleUser = async (id: string) => {
    await clerkClient.users.deleteUser(id);
}

