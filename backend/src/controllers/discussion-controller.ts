import type { Request, Response } from "express";
import db from "../configs/database.js";
import { discussionPostsTable } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { clerkClient, getAuth } from "@clerk/express";
import { io } from "../server.js";

export const getInventoryDiscussionPosts = async(req: Request, res: Response): Promise<void> => {
    try {
        const inventory = req.inventory;
        const posts = await db
            .select()
            .from(discussionPostsTable)
            .where(eq(discussionPostsTable.inventoryId, Number(inventory?.id)))
            .orderBy(asc(discussionPostsTable.createdAt));
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching discussion posts:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

export const createDiscussionPost = async(req: Request, res: Response): Promise<void> => {
    try {
        const inventory = req.inventory;
        const { content } = req.body;
        const { userId } = getAuth(req);

        if (!content || content.trim().length === 0) {
            res.status(400).json({ message: "Content is required" });
            return;
        }

        const user = await clerkClient.users.getUser(userId!);

        const newPost = await db
            .insert(discussionPostsTable)
            .values({
                inventoryId: Number(inventory?.id),
                userId: userId!,
                userEmail: user.emailAddresses[0]?.emailAddress || "unknown",
                userImageUrl: user.imageUrl || null,
                content,
            })
            .returning();

        io.to(`inventory_${inventory?.id}`).emit("new_post", newPost[0]);

        res.status(201).json(newPost[0]);
    } catch (error) {
        console.error("Error creating discussion post:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

export const deleteDiscussionPost = async(req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const { userId } = getAuth(req);

        const post = await db
            .select()
            .from(discussionPostsTable)
            .where(eq(discussionPostsTable.id, Number(postId)))
            .limit(1);
        
        if (post.length === 0) {
            res.status(404).json({ message: "Discussion post not found." });
            return;
        }

        const user = await clerkClient.users.getUser(userId!);
        const isAdmin = user.publicMetadata.role === 'admin';

        if (post[0]?.userId !== userId && !isAdmin) {
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