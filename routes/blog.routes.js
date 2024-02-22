import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { createBlog, getBlogpost, getHomeBlogs, tagBlog } from "../controllers/blog.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();


router.post("/blog",isLoggedIn, upload.single("postImage"), createBlog);
router.put("/:id", isLoggedIn, )
router.get("/", getHomeBlogs);

router.post("/tag", tagBlog);

router.get("/:blogid", getBlogpost);

export default router;