import { Router } from "express";
import { checkStatus, requireRole } from "../middleware/auth-middleware.js";
import { requireAuth } from "@clerk/express";
import { banUsers, deleteUsers, getUsers, unbanUsers, updateUserRole } from "../controllers/admin-controller.js";

const router = Router();

router.get("/users", requireRole("admin"), requireAuth(), checkStatus(), getUsers);
router.post("/users/role", requireRole("admin"), requireAuth(), checkStatus(), updateUserRole);
router.post("/users/ban", requireRole("admin"), requireAuth(), checkStatus(), banUsers);
router.post("/users/unban", requireRole("admin"), requireAuth(), checkStatus(), unbanUsers);
router.post("/users/delete", requireRole("admin"), requireAuth(), checkStatus(), deleteUsers);

export default router;