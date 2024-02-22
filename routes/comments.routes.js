import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { CreateComment, deleteComment, editComment } from "../controllers/comments.controller.js";

const router = Router();

router.post('/', isLoggedIn, CreateComment);
router.delete('/:commentId', isLoggedIn, deleteComment);
router.put('/:commentId',isLoggedIn, editComment);

export default router;