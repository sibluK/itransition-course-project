import type { Request, Response } from "express";
import db from "../config/database.js";
import { inventoriesTable } from "../db/schema.js";
import { desc, sql } from "drizzle-orm";

export const getResults = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;

        if (!query || query.trim().length === 0) {
            return res.json([]);
        }

        const tsvector = sql`setweight(to_tsvector('english', ${inventoriesTable.title}), 'A') || setweight(to_tsvector('english', ${inventoriesTable.description}), 'B')`;
        const tsquery = sql`plainto_tsquery('english', ${query})`;

        const results = await db
            .select()
            .from(inventoriesTable)
            .where(sql`${tsvector} @@ ${tsquery}`)
            .orderBy(desc(sql`ts_rank(${tsvector}, ${tsquery})`));

        res.json(results);
    } catch (error) {
        console.error("Error fetching search results:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}