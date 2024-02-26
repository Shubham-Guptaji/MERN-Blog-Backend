import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { AddResource, DeleteResource } from "../controllers/resource.controller.js";

const router = Router();

router.post("/" ,isLoggedIn, upload.single('resource'), AddResource);
router.delete("/:id", isLoggedIn, DeleteResource);

export default router;