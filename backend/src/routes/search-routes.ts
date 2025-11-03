import { Router } from "express";
import { getResults } from "../controllers/search-controller.js";

const router = Router();

router.get("/", getResults);

export default router;