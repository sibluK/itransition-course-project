import type { Request, Response } from "express";
import db from "../config/database.js"
import { categoriesTable } from "../db/schema.js";

export const getCategories = async (req: Request, res: Response) => {
    try {
        const response = await db.select().from(categoriesTable);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
}


