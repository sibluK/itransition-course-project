import db from "../configs/database.js";
import { inventoriesTable, inventoryWriteAccessTable } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

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
