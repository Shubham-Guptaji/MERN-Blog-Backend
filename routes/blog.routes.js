import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { DeletePost, PublishBlog, UpdatePost, createBlog, getBlogpost, getHomeBlogs, tagBlog, unPublishBlog } from "../controllers/blog.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();


router.post("/create",isLoggedIn, upload.single("postImage"), createBlog);
router.get("/", getHomeBlogs);
router.post("/tag", tagBlog);
router.patch("/publish/:id", isLoggedIn, PublishBlog);

router
    .route("/:id")
        .get(getBlogpost)
        .put(isLoggedIn, upload.single("postImage"), UpdatePost)
        .patch(isLoggedIn, unPublishBlog)
        .delete(isLoggedIn, DeletePost);

export default router;