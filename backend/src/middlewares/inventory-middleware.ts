import type { Request, Response, NextFunction } from 'express';
import db from '../configs/database.js';
import { inventoriesTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

declare global {
    namespace Express {
        interface Request {
            inventory: typeof inventoriesTable.$inferSelect | undefined;
        }
    }
}

export async function inventoryExists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const inventoryId = req.params.inventoryId || req.body.id;
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

        req.inventory = inventory[0];
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}