import { Router } from "express";
import { getItemsForInventory, createItem, updateItem, deleteItem } from "../controllers/item-controller.js";
import { requireAuth } from "@clerk/express";
import { checkStatus, hasWriteAccess } from "../middlewares/auth-middleware.js";
import { inventoryExists } from "../middlewares/inventory-middleware.js";

const router = Router();

router.get('/:inventoryId', inventoryExists, getItemsForInventory);
router.post('/:inventoryId', requireAuth(), checkStatus(), inventoryExists, hasWriteAccess("public"), createItem);
router.patch('/:inventoryId/:id', requireAuth(), checkStatus(), inventoryExists, hasWriteAccess("public"), updateItem);
router.delete('/:inventoryId/:id', requireAuth(), checkStatus(), inventoryExists, hasWriteAccess("public"), deleteItem);

export default router;
