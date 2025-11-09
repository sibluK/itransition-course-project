import { Router } from "express";
import { getCategories } from "../controllers/category-controller.js";
import { checkStatus } from "../middlewares/auth-middleware.js";
import { requireAuth } from "@clerk/express";

const router = Router();

router.get("/", requireAuth(), checkStatus(), getCategories);

export default router;