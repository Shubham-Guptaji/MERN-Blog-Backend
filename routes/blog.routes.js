import { Router } from "express";
import { isLoggedIn, isVerified } from "../middlewares/auth.middleware.js";
import { AllPosts, DeletePost, PublishBlog, UpdatePost, createBlog, getBlogpost, getHomeBlogs, tagBlog, unPublishBlog } from "../controllers/blog.controller.js";
import upload from "../middlewares/multer.middleware.js";
import rate from "../middlewares/requestLimit.js"

const router = Router();


router.post("/create", rate(60, 10), isLoggedIn, isVerified, upload.single("postImage"), createBlog);
router.get("/", rate(5, 30), getHomeBlogs);
router.get("/posts", rate(5, 30), AllPosts);
router.post("/tag", rate(5, 30), tagBlog);
router.patch("/publish/:id", rate(5, 25), isLoggedIn, isVerified, PublishBlog);
router.post("/:url", rate(5, 30), getBlogpost);
router
    .route("/:id")
        .put(rate(30, 15), isLoggedIn, isVerified, upload.single("postImage"), UpdatePost)
        .patch(rate(5, 25), isLoggedIn, isVerified, unPublishBlog)
        .delete(rate(5, 25), isLoggedIn, isVerified, DeletePost);

export default router;