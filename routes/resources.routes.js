import { Router } from "express";
import { isLoggedIn, isVerified } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { AddResource, BlogResource, DeleteResource, GetResources } from "../controllers/resource.controller.js";
import rate from "../middlewares/requestLimit.js";

const router = Router();

router.post("/" , rate(15*60*1000, 20), isLoggedIn, isVerified, upload.single('resource'), AddResource);
router.post("/blog/:id", rate(5*60*1000, 8), isLoggedIn, BlogResource);
router.get("/blog/:id/author/:authorId", rate(15*60*1000, 15), isLoggedIn, GetResources);
router.delete("/:id", rate(15*60*1000, 30), isLoggedIn, DeleteResource);

export default router;