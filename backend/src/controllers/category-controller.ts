import type { Request, Response } from "express";
import db from "../configs/database.js"
import { categoriesTable } from "../db/schema.js";

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await db.select().from(categoriesTable);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
}


