import { Router } from "express";
import { checkStatus, requireRole } from "../middleware/auth-middleware.js";
import { requireAuth } from "@clerk/express";
import { getUsersWithWriteAccessForInventory, addWriteAccessToUserForInventory, removeWriteAccessFromUsersForInventory } from "../controllers/access-controller.js";

const router = Router();

router.get("/inventories/:inventoryId/users", requireAuth(), checkStatus(), getUsersWithWriteAccessForInventory);
router.post("/inventories/:inventoryId/users", requireAuth(), checkStatus(), addWriteAccessToUserForInventory);
router.delete("/inventories/:inventoryId/users", requireAuth(), checkStatus(), removeWriteAccessFromUsersForInventory);

export default router;