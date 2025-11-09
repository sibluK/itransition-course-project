import { Router } from "express";
import { getCustomFieldsByInventoryId, updateCustomFieldsForInventory } from "../controllers/fields-controller.js";
import { requireAuth } from "@clerk/express";
import { inventoryExists } from "../middlewares/inventory-middleware.js";
import { checkStatus, hasWriteAccess } from "../middlewares/auth-middleware.js";

const router = Router();

router.get("/:inventoryId", 
    inventoryExists, 
    getCustomFieldsByInventoryId);
router.patch("/:inventoryId", 
    requireAuth(), 
    inventoryExists, 
    hasWriteAccess(),
    checkStatus(),
    updateCustomFieldsForInventory);

export default router;