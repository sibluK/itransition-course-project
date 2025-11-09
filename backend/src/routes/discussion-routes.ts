import { Router } from "express";
import { createDiscussionPost, deleteDiscussionPost, getInventoryDiscussionPosts } from "../controllers/discussion-controller.js";
import { requireAuth } from "@clerk/express";
import { checkStatus, hasWriteAccess } from "../middlewares/auth-middleware.js";
import { inventoryExists } from "../middlewares/inventory-middleware.js";

const router = Router();

router.get("/inventories/:inventoryId/posts", 
    requireAuth(), 
    inventoryExists, 
    hasWriteAccess("public"),
    checkStatus(), 
    getInventoryDiscussionPosts);
router.post("/inventories/:inventoryId/posts", 
    requireAuth(), 
    inventoryExists, 
    hasWriteAccess("public"),
    checkStatus(), 
    createDiscussionPost);
router.delete("/inventories/:inventoryId/posts/:postId", 
    requireAuth(), 
    inventoryExists, 
    hasWriteAccess("public"),
    checkStatus(), 
    deleteDiscussionPost);

export default router;