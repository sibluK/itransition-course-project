import { Router } from "express";
import { requireRole } from "../middleware/auth-middleware.js";
import { requireAuth } from "@clerk/express";
import { getUsers, updateUserRole } from "../controllers/admin-controller.js";

const router = Router();

router.get("/users", requireRole("admin"), requireAuth(), getUsers);
router.post("/users/role", requireRole("admin"), requireAuth(), updateUserRole);

export default router;