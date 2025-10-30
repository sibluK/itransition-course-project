import { getAuth } from "@clerk/express";
import type { Request, Response } from "express";
import db from "../config/database.js";
import { categoriesTable, inventoriesTable, inventoryTagsTable, inventoryWriteAccessTable, tagsTable } from "../db/schema.js";
import { eq, inArray, sql } from "drizzle-orm";
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
        const inventory = await db
            .select()
            .from(inventoriesTable)
            .where(eq(inventoriesTable.id, Number(inventoryId)))
            .limit(1);

        if (inventory.length === 0) {
            res.status(404).json({ error: 'Inventory not found' });
            return;
        }
        res.status(200).json({ inventory: inventory[0] });
    } catch (error) {
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

        if (tags.length < 0) {
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
        res.status(500).json({ error: 'Failed to delete inventory' });
    }
}
