import { Router } from "express";
import { checkStatus, hasWriteAccess } from "../middlewares/auth-middleware.js";
import { requireAuth } from "@clerk/express";
import { getUserInventories, getInventoryById, createInventory, deleteInventory, updateInventory, getHomeInventories, getAggregatedData, getInventoryApiToken } from "../controllers/inventory-controller.js";
import multer from "multer";
import { inventoryExists } from "../middlewares/inventory-middleware.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/home", getHomeInventories);
router.get("/users/:userId", requireAuth(), checkStatus(), getUserInventories);
router.get("/:inventoryId/api-token", requireAuth(), checkStatus(), inventoryExists, hasWriteAccess(), getInventoryApiToken);
router.get("/aggregated-data", getAggregatedData);
router.get("/:inventoryId", getInventoryById);
router.post("/", requireAuth(), checkStatus(), upload.single("image"), createInventory);
router.patch("/:inventoryId", requireAuth(), checkStatus(), inventoryExists, hasWriteAccess(), upload.single("image"), updateInventory);
router.delete("/:inventoryId", requireAuth(), checkStatus(), inventoryExists, hasWriteAccess(), deleteInventory);

export default router;