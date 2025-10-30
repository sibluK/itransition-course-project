import { Router } from "express";
import { getCategories } from "../controllers/category-controller.js";
import { checkStatus } from "../middleware/auth-middleware.js";
import { requireAuth } from "@clerk/express";

const router = Router();

router.get("/", checkStatus(), requireAuth(), getCategories);

export default router;