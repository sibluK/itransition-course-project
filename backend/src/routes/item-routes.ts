import { Router } from "express";
import { getItemsForInventory, createItem, updateItem, deleteItem } from "../controllers/item-controller.js";

const router = Router();

router.get('/:inventoryId', getItemsForInventory);
router.post('/:inventoryId', createItem);
router.patch('/:inventoryId/:id', updateItem);
router.delete('/:inventoryId/:id', deleteItem);

export default router;
