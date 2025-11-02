import { Router } from "express";
import { createDiscussionPost, deleteDiscussionPost, getInventoryDiscussionPosts } from "../controllers/discussion-controller.js";
import { requireAuth } from "@clerk/express";
import { checkStatus } from "../middleware/auth-middleware.js";

const router = Router();

router.get("/inventories/:inventoryId/posts", requireAuth(), checkStatus(), getInventoryDiscussionPosts);
router.post("/inventories/:inventoryId/posts", requireAuth(), checkStatus(), createDiscussionPost);
router.delete("/inventories/:inventoryId/posts/:postId", requireAuth(), checkStatus(), deleteDiscussionPost);

export default router;