import { clerkClient, getAuth } from "@clerk/express";
import type { Request, Response } from "express";
import db from "../configs/database.js";
import { inventoryWriteAccessTable } from "../db/schema.js";
import { eq, and, inArray } from "drizzle-orm";

export const getUsersWithWriteAccessForInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search } = req.query;
        const inventory = req.inventory;

        const writeAccessUserIds = await db
            .select({ userId: inventoryWriteAccessTable.userId })
            .from(inventoryWriteAccessTable)
            .where(eq(inventoryWriteAccessTable.inventoryId, Number(inventory?.id)));

        const userIds = writeAccessUserIds.map((entry) => String(entry.userId));

        if (userIds.length === 0) {
            res.status(200).json([]);
            return;
        }

        const { data: users } = await clerkClient.users.getUserList({
            userId: userIds,
            limit: 100,
            ...(search && { query: search as string }),
        });

        res.status(200).json(users.map((user) => ({
            id: user.id,
            name: user.fullName,
            email: user.emailAddresses[0]?.emailAddress || "",
            imageUrl: user.imageUrl || "",
        })));
    } catch (error) {
        console.error("Error fetching users with write access:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addWriteAccessToUserForInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        const { targetUserId } = req.body;
        const inventory = req.inventory;

        if (targetUserId === userId) {
            res.status(400).json({ message: "Cannot add write access to the inventory owner" });
            return;
        }

        const user = await clerkClient.users.getUser(targetUserId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const existingEntry = await db
            .select()
            .from(inventoryWriteAccessTable)
            .where(and(
                eq(inventoryWriteAccessTable.inventoryId, Number(inventory?.id)),
                eq(inventoryWriteAccessTable.userId, targetUserId)
            ))
            .limit(1);

        if (existingEntry.length > 0) {
            res.status(400).json({ message: "User already has write access" });;
            return;
        }

        await db
            .insert(inventoryWriteAccessTable)
            .values({
                inventoryId: Number(inventory?.id),
                userId: targetUserId,
            });
        
        res.status(201).json({
            id: user.id,
            name: user.fullName,
            email: user.emailAddresses[0]?.emailAddress || "",
            imageUrl: user.imageUrl || "",
        });
    } catch (error) {
        console.error("Error adding write access to user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeWriteAccessFromUsersForInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        const { userIds } = req.body;
        const inventory = req.inventory;

        if (userIds.length === 0 || !Array.isArray(userIds)) {
            res.status(400).json({ message: "Atleast 1 userId is required" });
            return;
        }

        if (userIds.includes(userId)) {
            res.status(400).json({ message: "Cannot remove write access from the inventory owner" });
            return;
        }

        const existingEntries = await db
            .select({ userIds: inventoryWriteAccessTable.userId })
            .from(inventoryWriteAccessTable)
            .where(and(
                eq(inventoryWriteAccessTable.inventoryId, Number(inventory?.id)),
                inArray(inventoryWriteAccessTable.userId, userIds)
            ));

        if (existingEntries.length === 0) {
            res.status(400).json({ message: "None of the users have write access" });
            return;
        }

        await db
            .delete(inventoryWriteAccessTable)
            .where(and(
                eq(inventoryWriteAccessTable.inventoryId, Number(inventory?.id)),
                inArray(inventoryWriteAccessTable.userId, userIds)
            ));

        res.status(204).json({ message: "Write access removed successfully" });
    } catch (error) {
        console.error("Error removing write access from user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};