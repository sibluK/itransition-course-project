import type { Request, Response } from "express";
import db from "../config/database.js";
import { discussionPostsTable } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { checkInventoryExists } from "../utils/dbUtil.js";
import { clerkClient, getAuth } from "@clerk/express";
import { io } from "../server.js";

export const getInventoryDiscussionPosts = async(req: Request, res: Response): Promise<void> => {
    try {
        const { inventoryId } = req.params;

        const inventoryExists = await checkInventoryExists(Number(inventoryId));

        if (!inventoryExists) {
            res.status(404).json({ message: "Inventory not found." });
            return;
        }

        const posts = await db
            .select()
            .from(discussionPostsTable)
            .where(eq(discussionPostsTable.inventoryId, Number(inventoryId)))
            .orderBy(asc(discussionPostsTable.createdAt));

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching discussion posts:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

export const createDiscussionPost = async(req: Request, res: Response): Promise<void> => {
    try {
        const { inventoryId } = req.params;
        const { content } = req.body;
        const { userId } = getAuth(req);

        if (!content || content.trim().length === 0) {
            res.status(400).json({ message: "Content is required" });
            return;
        }

        const inventoryExists = await checkInventoryExists(Number(inventoryId));

        if (!inventoryExists) {
            res.status(404).json({ message: "Inventory not found." });
            return;
        }

        const user = await clerkClient.users.getUser(userId!);

        const newPost = await db
            .insert(discussionPostsTable)
            .values({
                inventoryId: Number(inventoryId),
                userId: userId!,
                userEmail: user.emailAddresses[0]?.emailAddress || "unknown",
                userImageUrl: user.imageUrl || null,
                content,
            })
            .returning();

        io.to(`inventory_${inventoryId}`).emit("new_post", newPost[0]);

        res.status(201).json(newPost[0]);
    } catch (error) {
        console.error("Error creating discussion post:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

export const deleteDiscussionPost = async(req: Request, res: Response): Promise<void> => {
    try {
        const { inventoryId, postId } = req.params;
        const { userId } = getAuth(req);

        const inventoryExists = await checkInventoryExists(Number(inventoryId));

        if (!inventoryExists) {
            res.status(404).json({ message: "Inventory not found." });
            return;
        }

        const post = await db
            .select()
            .from(discussionPostsTable)
            .where(eq(discussionPostsTable.id, Number(postId)))
            .limit(1);
        
        if (post.length === 0) {
            res.status(404).json({ message: "Discussion post not found." });
            return;
        }

        if (post[0]?.userId !== userId) {
            res.status(403).json({ message: "You do not have permission to delete this post." });
            return;
        }

        await db
            .delete(discussionPostsTable)
            .where(eq(discussionPostsTable.id, Number(postId)));

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting discussion post:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};