import { Router } from "express";
import { checkStatus, hasWriteAccess } from "../middlewares/auth-middleware.js";
import { requireAuth } from "@clerk/express";
import { getUsersWithWriteAccessForInventory, addWriteAccessToUserForInventory, removeWriteAccessFromUsersForInventory } from "../controllers/access-controller.js";
import { inventoryExists } from "../middlewares/inventory-middleware.js";

const router = Router();

router.get("/inventories/:inventoryId/users",
    requireAuth(),
    inventoryExists, 
    hasWriteAccess(),
    checkStatus(), 
    getUsersWithWriteAccessForInventory);
router.post("/inventories/:inventoryId/users", 
    requireAuth(), 
    inventoryExists, 
    hasWriteAccess(),
    checkStatus(), 
    addWriteAccessToUserForInventory);
router.delete("/inventories/:inventoryId/users", 
    requireAuth(), 
    inventoryExists,
    hasWriteAccess(),
    checkStatus(), 
    removeWriteAccessFromUsersForInventory);

export default router