import { Router } from "express";
import { isLoggedIn, isVerified } from "../middlewares/auth.middleware.js";
import { CreateComment, deleteComment, editComment, fetchComment } from "../controllers/comments.controller.js";
import rate from "../middlewares/requestLimit.js";

const router = Router();

router.post('/', rate(5*60*1000, 8), isLoggedIn, isVerified, CreateComment);
router.get('/:blogId', rate(5*60*1000, 50), fetchComment);
router 
    .route('/:commentId')
        .delete(rate(5*60*1000, 5), isLoggedIn, deleteComment)
        .put(rate(5*60*1000, 8), isLoggedIn, editComment);


export default router;