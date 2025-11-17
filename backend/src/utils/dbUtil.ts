import { randomBytes } from "crypto";
import db from "../configs/database.js";
import { inventoriesTable, inventoryWriteAccessTable } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import * as bcrypt from 'bcrypt';

export const checkInventoryExists = async (inventoryId: number): Promise<boolean> => {
    const inventory = await db
        .select()
        .from(inventoriesTable)
        .where(eq(inventoriesTable.id, inventoryId))
        .limit(1);

    return inventory.length > 0;
}

export const checkWriteAccess = async (inventoryId: number, userId: string): Promise<boolean> => {
    const access = await db
        .select()
        .from(inventoryWriteAccessTable)
        .where(and(
            eq(inventoryWriteAccessTable.inventoryId, inventoryId),
            eq(inventoryWriteAccessTable.userId, userId)
        ))
        .limit(1);
    return access.length > 0;
}

export const findInventoryByApiToken = async (apiToken: string) => {
    const inventories = await db
        .select()
        .from(inventoriesTable)
        .where(sql`${inventoriesTable.apiToken} IS NOT NULL`);

    for (const inventory of inventories) {
        const isMatch = await bcrypt.compare(apiToken, inventory.apiToken);
        if (isMatch) {
            return inventory;
        }
    }

    return null;
};

export const generateApiToken = async (): Promise<string> => {
    const token = randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(token, 10);
    return hashedToken;
}