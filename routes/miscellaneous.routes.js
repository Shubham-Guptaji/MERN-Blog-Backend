import { Router } from "express";
import { DisLikePost, LikePost, contactformHandler, followUser, unfollowUser, userFollowers } from "../controllers/miscellaneous.controllers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/contact", contactformHandler);
router.post("/followers", isLoggedIn, userFollowers);
router.post("/follower/follow", isLoggedIn, followUser);
router.delete("/follower/unfollow/:FollowId", isLoggedIn, unfollowUser)
router.post("/like/:postId", isLoggedIn, LikePost);
router.delete('/dislike/:postId', isLoggedIn, DisLikePost)



export default router;