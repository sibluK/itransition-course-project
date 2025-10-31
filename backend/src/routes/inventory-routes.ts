import { Router } from "express";
import { checkStatus } from "../middleware/auth-middleware.js";
import { requireAuth } from "@clerk/express";
import { getUserInventories, getInventoryById, createInventory, deleteInventory, updateInventory } from "../controllers/inventory-controller.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/users/:userId", requireAuth(), checkStatus(), getUserInventories);
router.get("/:inventoryId", getInventoryById);
router.post("/", requireAuth(), checkStatus(), upload.single("image"), createInventory);
router.patch("/:inventoryId", requireAuth(), checkStatus(), upload.single("image"), updateInventory);
router.delete("/:inventoryId", requireAuth(), checkStatus(), deleteInventory);


export default router;