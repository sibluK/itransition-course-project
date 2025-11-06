import { clerkClient, getAuth } from "@clerk/express";
import type { Request, Response } from "express";
import db from "../config/database.js";
import { categoriesTable, inventoriesTable, inventoryTagsTable, inventoryWriteAccessTable, tagsTable } from "../db/schema.js";
import { and, eq, inArray, sql } from "drizzle-orm";
import { deleteFileFromS3, uploadFileToS3 } from "../config/s3.js";

export const getUserInventories = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const ownedInventories = await db
            .select({
                inventory: inventoriesTable,
                category: categoriesTable,
                tags: sql`coalesce(json_agg(distinct ${tagsTable}.*) filter (where ${tagsTable}.id is not null), '[]'::json)`,
            })
            .from(inventoriesTable)
            .where(eq(inventoriesTable.creatorId, userId))
            .leftJoin(categoriesTable, eq(inventoriesTable.categoryId, categoriesTable.id))
            .leftJoin(inventoryTagsTable, eq(inventoriesTable.id, inventoryTagsTable.inventoryId))
            .leftJoin(tagsTable, eq(inventoryTagsTable.tagId, tagsTable.id))
            .groupBy(inventoriesTable.id, categoriesTable.id);

        const writeAccessSubquery = db
            .select({ inventoryId: inventoryWriteAccessTable.inventoryId })
            .from(inventoryWriteAccessTable)
            .where(eq(inventoryWriteAccessTable.userId, userId));

        const writeAccessInventories = await db
            .select({
                inventory: inventoriesTable,
                category: categoriesTable,
                tags: sql`coalesce(json_agg(distinct ${tagsTable}.*) filter (where ${tagsTable}.id is not null), '[]'::json)`,
            })
            .from(inventoriesTable)
            .where(inArray(inventoriesTable.id, writeAccessSubquery))
            .leftJoin(categoriesTable, eq(inventoriesTable.categoryId, categoriesTable.id))
            .leftJoin(inventoryTagsTable, eq(inventoriesTable.id, inventoryTagsTable.inventoryId))
            .leftJoin(tagsTable, eq(inventoryTagsTable.tagId, tagsTable.id))
            .groupBy(inventoriesTable.id, categoriesTable.id);

        res.status(200).json({ 
            ownedInventories: ownedInventories,
            writeAccessInventories: writeAccessInventories,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user inventories' });
    }
}

export const getInventoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const inventoryId = req.params.inventoryId;
        if (!inventoryId) {
            res.status(400).json({ error: 'Inventory ID is required' });
            return;
        }
        const inventoryData = await db
            .select({
                inventory: inventoriesTable,
                tags: sql`coalesce(json_agg(distinct ${tagsTable}.*) filter (where ${tagsTable}.id is not null), '[]'::json)`,
            })
            .from(inventoriesTable)
            .where(eq(inventoriesTable.id, Number(inventoryId)))
            .leftJoin(inventoryTagsTable, eq(inventoriesTable.id, inventoryTagsTable.inventoryId))
            .leftJoin(tagsTable, eq(inventoryTagsTable.tagId, tagsTable.id))
            .groupBy(inventoriesTable.id)
            .limit(1);

        if (inventoryData.length === 0) {
            res.status(404).json({ error: 'Inventory not found' });
            return;
        }

        let writeAccess = false;

        const { inventory, tags } = inventoryData[0] as { inventory: typeof inventoriesTable.$inferSelect; tags: any[] };

        const { userId } = getAuth(req);

        if (userId) {
            if (inventory && inventory.creatorId === userId) {
                writeAccess = true;
            } else {
                const accessRecord = await db
                    .select()
                    .from(inventoryWriteAccessTable)
                    .where(and(
                        eq(inventoryWriteAccessTable.inventoryId, Number(inventoryId)),
                        eq(inventoryWriteAccessTable.userId, userId)
                    ))
                    .limit(1);
                if (accessRecord.length > 0) {
                    writeAccess = true;
                }
            }
        }

        try {
            const user = await clerkClient.users.getUser(inventory.creatorId);
            if (user.publicMetadata.role === 'admin') {
                writeAccess = true;
            }
        } catch (clerkError) {
            console.error('Error fetching user from Clerk:', clerkError);
        }

        res.status(200).json({ 
            inventory: inventory,
            tags: tags,
            writeAccess: writeAccess
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
}

export const createInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, categoryId, tags } = req.body;
        const file: Express.Multer.File | undefined = req.file;
        const { userId } = getAuth(req);

        console.log('Creating inventory with data:', { title, description, categoryId, file, tags, userId });

        let uploadedImageUrl: string | undefined = undefined;
        if (file) {
            const { url } = await uploadFileToS3(file.buffer, file.mimetype);
            uploadedImageUrl = url;
            console.log('Uploaded file to S3 with url:', url);
        }

        const newInventory = await db
            .insert(inventoriesTable)
            .values({
                creatorId: userId!,
                title,
                description,
                categoryId: categoryId ? Number(categoryId) : undefined,
                image_url: uploadedImageUrl,
            })
            .returning();

        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            res.status(201).json({ message: 'Inventory created' });
            return;
        }

        const normalizedTagNames = Array.from(new Set(tags.map((tag: string) => tag.trim().toLowerCase())));

        const existingTags = await db
            .select()
            .from(tagsTable)
            .where(inArray(sql`lower(${tagsTable.name})`, normalizedTagNames));

        const existingTagNames = existingTags.map(tag => tag.name.toLowerCase());
        
        const newTagNames = normalizedTagNames.filter(name => !existingTagNames.includes(name as string));

        if (newTagNames.length > 0) {
            const newTagsInserts = newTagNames.map(name => ({ name }));
            await db
                .insert(tagsTable)
                .values(newTagsInserts as any)
                .onConflictDoNothing();
        }
        const allTags = await db
            .select()
            .from(tagsTable)
            .where(inArray(sql`lower(${tagsTable.name})`, normalizedTagNames));
        
        const inventoryTagInserts = allTags.map(tag => ({
            inventoryId: newInventory[0]?.id,
            tagId: tag.id,
        }));

        await db
            .insert(inventoryTagsTable)
            .values(inventoryTagInserts as any)
            .onConflictDoNothing({ target: [inventoryTagsTable.inventoryId, inventoryTagsTable.tagId] });
        
        res.status(201).json({ message: 'Inventory created' });

    } catch (error) {
        console.error('Error creating inventory:', error);
        res.status(500).json({ error: 'Failed to create inventory' });
    }
}

export const updateInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { inventoryId } = req.params;
        const { title, description, categoryId, isPublic, version, tags } = req.body;
        const file: Express.Multer.File | undefined = req.file;
        const { userId } = getAuth(req);

        console.log(req.body);

        console.log(file);

        const inventory = await db
            .select()
            .from(inventoriesTable)
            .where(eq(inventoriesTable.id, Number(inventoryId)))
            .limit(1);

        if (inventory.length === 0) {
            res.status(404).json({ error: 'Inventory not found' });
            return;
        }
        
        if (inventory[0] && inventory[0].creatorId !== userId) {
            res.status(403).json({ error: 'Unauthorized to update this inventory' });
            return;
        }

        const updateData: Partial<typeof inventoriesTable.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (categoryId !== undefined) updateData.categoryId = categoryId ? Number(categoryId) : undefined;
        if (isPublic !== undefined) updateData.isPublic = isPublic;

        let uploadedImageUrl: string | null | undefined = inventory[0]?.image_url;
        if (file) {
            if (inventory[0]?.image_url) {
                await deleteFileFromS3(inventory[0]?.image_url);
            }
            const { url } = await uploadFileToS3(file.buffer, file.mimetype);
            uploadedImageUrl = url;
            updateData.image_url = uploadedImageUrl;
        }

        console.log('Updating inventory with data:', updateData);

        if (tags !== undefined) {
            const normalizedTagNames = Array.from(new Set(tags.map((tag: string) => tag.trim().toLowerCase())));

            const existingTags = await db
                .select()
                .from(tagsTable)
                .where(inArray(sql`lower(${tagsTable.name})`, normalizedTagNames));

            const existingTagNames = existingTags.map(t => t.name.toLowerCase());
            const newTagNames = normalizedTagNames.filter(name => !existingTagNames.includes(name as string));

            if (newTagNames.length > 0) {
                const newTagsInserts = newTagNames.map(name => ({ name }));
                await db.insert(tagsTable).values(newTagsInserts as any).onConflictDoNothing();
            }

            const allTags = await db
                .select()
                .from(tagsTable)
                .where(inArray(sql`lower(${tagsTable.name})`, normalizedTagNames));

            await db.delete(inventoryTagsTable).where(eq(inventoryTagsTable.inventoryId, Number(inventoryId)));

            const inventoryTagInserts = allTags.map(tag => ({
                inventoryId: Number(inventoryId),
                tagId: tag.id,
            }));
            await db.insert(inventoryTagsTable).values(inventoryTagInserts).onConflictDoNothing();
        }

        const updatedInventory = await db
            .update(inventoriesTable)
            .set({
                ...updateData,
                version: sql`${inventoriesTable.version} + 1`,
            })
            .where(and(
                eq(inventoriesTable.id, Number(inventoryId)),
                eq(inventoriesTable.version, version)
            ))
            .returning();

        if (updatedInventory.length === 0) {
            res.status(409).json({ error: 'Version conflict: inventory was modified by another user' });
            return;
        }

        res.status(200).json(updatedInventory[0]);
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Failed to update inventory' });
    }
}

export const uploadInventoryImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { inventoryId } = req.params;
        const file: Express.Multer.File | undefined = req.file;
        const { userId } = getAuth(req);
        if (!file) {
            res.status(400).json({ error: 'Image file is required' });
            return;
        }
        const inventory = await db
            .select()
            .from(inventoriesTable)
            .where(eq(inventoriesTable.id, Number(inventoryId)))
            .limit(1);
        if (inventory.length === 0) {
            res.status(404).json({ error: 'Inventory not found' });
            return;
        }
        if (inventory[0] && inventory[0].creatorId !== userId) {
            res.status(403).json({ error: 'Unauthorized to upload image for this inventory' });
            return;
        }
        if (inventory[0]?.image_url) {
            await deleteFileFromS3(inventory[0]?.image_url);
        }
        const { url } = await uploadFileToS3(file.buffer, file.mimetype);
        await db
            .update(inventoriesTable)
            .set({ image_url: url, updatedAt: new Date() })
            .where(eq(inventoriesTable.id, Number(inventoryId)));
        res.status(200).json({ imageUrl: url });
    } catch (error) {
        console.error('Error uploading inventory image:', error);
        res.status(500).json({ error: 'Failed to upload inventory image' });
    }
}

export const deleteInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        const inventoryId = req.params.inventoryId;
        if (!inventoryId) {
            res.status(400).json({ error: 'Inventory ID is required' });
            return;
        }
        const inventory = await db
            .select()
            .from(inventoriesTable)
            .where(eq(inventoriesTable.id, Number(inventoryId)))
            .limit(1);

        if (inventory[0] && inventory.length === 0) {
            res.status(404).json({ error: 'Inventory not found' });
            return;
        }

        if (inventory[0] && inventory[0].creatorId !== userId) {
            res.status(403).json({ error: 'Unauthorized to delete this inventory' });
            return;
        }

        await db
            .delete(inventoriesTable)
            .where(eq(inventoriesTable.id, Number(inventoryId)));

        if (inventory[0] && inventory[0].image_url) {
            await deleteFileFromS3(inventory[0].image_url);
        }

        res.status(200).json({ message: 'Inventory deleted successfully' });    
    } catch (error) {
        console.error('Error deleting inventory:', error);
        res.status(500).json({ error: 'Failed to delete inventory' });
    }
}
