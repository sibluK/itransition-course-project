import { Router } from "express";
import { getUsers } from "../controllers/user-controller.js";
import { requireAuth } from "@clerk/express";
import { checkStatus } from "../middlewares/auth-middleware.js";

const router = Router();

router.get("/", requireAuth(), checkStatus(), getUsers);

export default router;