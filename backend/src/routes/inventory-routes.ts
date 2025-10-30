import { Router } from "express";
import { checkStatus } from "../middleware/auth-middleware.js";
import { requireAuth } from "@clerk/express";
import { getUserInventories, getInventoryById, createInventory } from "../controllers/inventory-controller.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/users/:userId", requireAuth(), checkStatus(), getUserInventories);
router.get("/:inventoryId", requireAuth(), checkStatus(), getInventoryById);
router.post("/", requireAuth(), checkStatus(), upload.single("image"), createInventory);

export default router;