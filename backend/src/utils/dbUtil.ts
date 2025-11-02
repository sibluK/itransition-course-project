import db from "../config/database.js";
import { inventoriesTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const checkInventoryExists = async (inventoryId: number): Promise<boolean> => {
    const inventory = await db
        .select()
        .from(inventoriesTable)
        .where(eq(inventoriesTable.id, inventoryId))
        .limit(1);

    return inventory.length > 0;
}