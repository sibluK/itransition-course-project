import { Router } from "express";
import { getUserProfile, getUsers } from "../controllers/user-controller.js";
import { requireAuth } from "@clerk/express";

const router = Router();

router.get("/profile", requireAuth(), getUserProfile);
router.get("/", requireAuth(), getUsers);

export default router;