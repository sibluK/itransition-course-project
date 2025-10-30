import type { Request, Response } from "express";
import db from "../config/database.js";
import { tagsTable } from "../db/schema.js";
import { like } from "drizzle-orm";

export const getTags = async (req: Request, res: Response) => {
    const { search } = req.query;

    try {
        const tags = await db
            .select()
            .from(tagsTable)
            .where(like(tagsTable.name, `${search ?? ""}%`))
            .limit(5);

        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tags" });
    }
}