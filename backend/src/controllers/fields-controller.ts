import type { Request, Response } from "express";
import { checkInventoryExists } from "../utils/dbUtil.js";
import { customFieldsTable } from "../db/schema.js";
import db from "../config/database.js";
import { eq, and } from "drizzle-orm";

type FieldType = "sl_string" | "ml_string" | "number" | "link" | "boolean";

export const getCustomFieldsByInventoryId = async (req: Request, res: Response) => {
    try {
        const inventoryId = Number(req.params.inventoryId);
        if (isNaN(inventoryId)) {
            return res.status(400).json({ message: "Invalid inventory ID" });
        }

        const exists = await checkInventoryExists(inventoryId);
        if (!exists) {
            return res.status(404).json({ message: "Inventory not found" });
        }

        const customFields = await db
            .select()
            .from(customFieldsTable)
            .where(
                eq(customFieldsTable.inventoryId, inventoryId),
            );

        res.json(customFields);

    } catch (error) {
        console.error("Error fetching custom fields:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateCustomFieldsForInventory = async (req: Request, res: Response) => {
    try {
        const inventoryId = Number(req.params.inventoryId);
        if (isNaN(inventoryId)) {
            return res.status(400).json({ message: "Invalid inventory ID" });
        }

        const exists = await checkInventoryExists(inventoryId);
        if (!exists) {
            return res.status(404).json({ message: "Inventory not found" });
        }

        const updates: Array<{
            fieldKey: string;
            label?: string;
            description?: string;
            isEnabled?: boolean;
            displayOrder?: number;
        }> = req.body;

        const getFieldType = (key: string): FieldType | null => {
            if (key.startsWith('sl_string_')) return 'sl_string';
            if (key.startsWith('ml_string_')) return 'ml_string';
            if (key.startsWith('number_')) return 'number';
            if (key.startsWith('link_')) return 'link';
            if (key.startsWith('boolean_')) return 'boolean';
            return null;
        };

        for (const update of updates) {
            const { fieldKey, label, description, isEnabled, displayOrder } = update;
            if (!fieldKey || typeof fieldKey !== 'string') {
                return res.status(400).json({ message: "Invalid or missing fieldKey in update" });
            }
            const fieldType = getFieldType(fieldKey);
            if (!fieldType) {
                return res.status(400).json({ message: `Invalid field key: ${fieldKey}` });
            }

            const existingField = await db
                .select()
                .from(customFieldsTable)
                .where(and(
                    eq(customFieldsTable.inventoryId, inventoryId),
                    eq(customFieldsTable.fieldKey, fieldKey)
                ))
                .limit(1);

            if (existingField.length > 0) {
                const updateData: any = {};
                if (label !== undefined) updateData.label = label;
                if (description !== undefined) updateData.description = description;
                if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
                if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
                await db
                    .update(customFieldsTable)
                    .set(updateData)
                    .where(and(
                        eq(customFieldsTable.inventoryId, inventoryId),
                        eq(customFieldsTable.fieldKey, fieldKey)
                    ));
            } else if (isEnabled) {
                await db
                    .insert(customFieldsTable)
                    .values({
                        inventoryId,
                        customId: crypto.randomUUID(),
                        fieldKey,
                        fieldType,
                        label: label || '',
                        description: description || '',
                        isEnabled: true,
                        displayOrder: displayOrder || 0,
                    });
            }
        }

        res.status(200).json({ message: "Custom fields updated successfully" });
    } catch (error) {
        console.error("Error updating custom fields:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}