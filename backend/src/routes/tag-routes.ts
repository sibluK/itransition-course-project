import { Router } from "express";
import { getTags } from "../controllers/tags-controller.js";

const router = Router();

router.get("/", getTags);

export default router;