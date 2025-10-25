import { Router } from "express";
import { getUserProfile } from "../controllers/user-controller.js";
import { requireAuth } from "@clerk/express";

const router = Router();

router.get("/profile", requireAuth(), getUserProfile);

export default router;