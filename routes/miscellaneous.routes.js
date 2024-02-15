import { Router } from "express";
import { contactformHandler } from "../controllers/miscellaneous.controllers.js";

const router = Router();

router.post("/contact", contactformHandler);



export default router;