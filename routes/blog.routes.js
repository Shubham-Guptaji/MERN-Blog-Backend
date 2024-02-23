import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { DeletePost, UpdatePost, createBlog, getBlogpost, getHomeBlogs, tagBlog } from "../controllers/blog.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();


router.post("/blog",isLoggedIn, upload.single("postImage"), createBlog);
router.get("/", getHomeBlogs);
// router.put("/:id", isLoggedIn, UpdatePost);
router.post("/tag", tagBlog);
// router.get("/:id", getBlogpost);
// router.delete("/:id", isLoggedIn, DeletePost);

router
    .route("/:id")
        .get(getBlogpost)
        .put(isLoggedIn, UpdatePost)
        .delete(isLoggedIn, DeletePost);

export default router;