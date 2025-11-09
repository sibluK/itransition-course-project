import { Router } from "express";
import { checkStatus, requireRole } from "../middlewares/auth-middleware.js";
import { requireAuth } from "@clerk/express";
import { banUsers, deleteUsers, getUsers, unbanUsers, updateUserRole } from "../controllers/admin-controller.js";

const router = Router();

router.get("/users", requireAuth(), checkStatus(), requireRole("admin"), getUsers);
router.post("/users/role", requireAuth(), checkStatus(), requireRole("admin"), updateUserRole);
router.post("/users/ban", requireAuth(), checkStatus(), requireRole("admin"), banUsers);
router.post("/users/unban", requireAuth(), checkStatus(), requireRole("admin"), unbanUsers);
router.post("/users/delete", requireAuth(), checkStatus(), requireRole("admin"), deleteUsers)

export default router;