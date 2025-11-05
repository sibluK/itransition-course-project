import type { Request, Response } from "express";
import db from "../config/database.js";
import { inventoriesTable, itemsTable } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { checkInventoryExists } from "../utils/dbUtil.js";
import { getAuth } from "@clerk/express";

export const getItemsForInventory = async (req: Request, res: Response) => {
    try {
        const { inventoryId } = req.params;

        const exists = await checkInventoryExists(Number(inventoryId));
        if (!exists) {
            res.status(404).json({ message: 'Inventory not found' });
            return;
        }

        const items = await db
            .select()
            .from(itemsTable)
            .where(eq(itemsTable.inventoryId, Number(inventoryId)));

        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}
    
export const createItem = async (req: Request, res: Response) => {
    try {
        const { inventoryId } = req.params;
        const itemData = req.body;

        const exists = await checkInventoryExists(Number(inventoryId));
        if (!exists) {
            res.status(404).json({ message: 'Inventory not found' });
            return;
        }

        const newItem = await db
            .insert(itemsTable)
            .values({
                ...itemData,
                inventoryId: Number(inventoryId),
            })
            .returning();

        res.status(201).json({ newItem });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateItem = async (req: Request, res: Response) => {
    try {
        const { id, inventoryId } = req.params;
        const { version, ...updates } = req.body;
        const { userId } = getAuth(req);

        const item = await db
            .select()
            .from(itemsTable)
            .where(eq(itemsTable.id, Number(id)))
            .limit(1);

        if (item.length === 0) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }

        // Check if user has write access to the inventory

        const updatedItem = await db
            .update(itemsTable)
            .set({
                ...updates,
                version: version + 1, 
                updatedAt: new Date(),
            })
            .where(and(
                eq(itemsTable.id, Number(id)),
                eq(itemsTable.version, version) 
            ))
            .returning();

        if (updatedItem.length === 0) {
           res.status(409).json({ message: 'Conflict: Item was modified by another user. Please refresh and try again.' });
            return;
        }

        res.status(200).json({ updatedItem });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { version } = req.body;

        const result = await db
            .delete(itemsTable)
            .where(and(eq(itemsTable.id, Number(id)), eq(itemsTable.version, version)))
            .returning();

        if (result.length === 0) {
            return res.status(409).json({ message: 'Conflict: Item was modified by another user. Please refresh and try again.' });
        }

        res.status(200).json({ message: 'Item deleted' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: "Internal server error" });
    }

}