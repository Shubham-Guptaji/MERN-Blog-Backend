import { Router } from "express";
import { isLoggedIn, isVerified } from "../middlewares/auth.middleware.js";
import { CreateComment, deleteComment, editComment, fetchComment } from "../controllers/comments.controller.js";
import rate from "../middlewares/requestLimit.js";

const router = Router();

router.post('/', rate(5, 10), isLoggedIn, isVerified, CreateComment);
router.get('/:blogId', rate(5, 25), fetchComment);
router 
    .route('/:commentId')
        .delete(rate(5, 30), isLoggedIn, deleteComment)
        .put(rate(5, 20), isLoggedIn, editComment);


export default router;