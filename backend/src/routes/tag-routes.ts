import { Router } from "express";
import { getTags } from "../controllers/tags-controller.js";
import { requireAuth } from "@clerk/express";
import { checkStatus } from "../middlewares/auth-middleware.js";

const router = Router();

router.get("/", requireAuth(), checkStatus(), getTags);

export default router;