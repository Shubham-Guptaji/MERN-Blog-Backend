import { Router } from "express";
import { LikePost, contactformHandler, followUser, unfollowUser } from "../controllers/miscellaneous.controllers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/contact", contactformHandler);
router.post("/follower/follow", isLoggedIn, followUser);
router.delete("/follower/unfollow/:FollowId", isLoggedIn, unfollowUser)
router.post("/like/:postId", isLoggedIn, LikePost);
router.delete('/dislike/:postId', isLoggedIn, DisLikePost)



export default router;