import { Router } from "express";
import { getCustomFieldsByInventoryId, updateCustomFieldsForInventory } from "../controllers/fields-controller.js";

const router = Router();

router.get("/:inventoryId", getCustomFieldsByInventoryId);
router.patch("/:inventoryId", updateCustomFieldsForInventory);

export default router;