import { Router } from "express";
import { isLoggedIn, isVerified } from "../middlewares/auth.middleware.js";
import { AllPosts, DeletePost, PublishBlog, UpdatePost, createBlog, getBlogpost, getHomeBlogs, tagBlog, unPublishBlog } from "../controllers/blog.controller.js";
import upload from "../middlewares/multer.middleware.js";
import rate from "../middlewares/requestLimit.js"

const router = Router();


router.post("/create", rate(15*60*1000, 8), isLoggedIn, isVerified, upload.single("postImage"), createBlog);
router.get("/", rate(5*60*1000, 30), getHomeBlogs);
router.get("/posts", rate(5*60*1000, 20), AllPosts);
router.post("/tag", rate(5*60*1000, 30), tagBlog);
router.patch("/publish/:id", rate(5*60*1000, 10), isLoggedIn, PublishBlog);
router.post("/:url", rate(5*60*1000, 20), getBlogpost);
router
    .route("/:id")
        .put(rate(15*60*1000, 10), isLoggedIn, upload.single("postImage"), UpdatePost)
        .patch(rate(15*60*1000, 20), isLoggedIn, unPublishBlog)
        .delete(rate(15*60*1000, 12), isLoggedIn, DeletePost);

export default router;