import { Router } from "express";
import { UnLikePost, LikePost, contactformHandler, followUser, unfollowUser, userFollowers, UserFollowing, AllContacts, DeleteContact, PostLikes, IsFollowing } from "../controllers/miscellaneous.controllers.js";
import { isAdmin, isLoggedIn, isVerified } from "../middlewares/auth.middleware.js";
import rate from "../middlewares/requestLimit.js";

const router = Router(); 

// rate(minute, allowedCount);

router.post("/contact", rate(15, 5), contactformHandler);
router.get("/contact", rate(15, 40), isLoggedIn, isVerified, isAdmin, AllContacts);
router.delete("/contact/:id", rate(5, 50), isLoggedIn, isAdmin, DeleteContact);
router.get("/followers", rate(5, 20), isLoggedIn, userFollowers);
router.get("/following", rate(5, 20), isLoggedIn, isVerified, UserFollowing);
router.post("/follower/follow", rate(5, 15), isLoggedIn, isVerified, followUser);
router.delete("/follower/unfollow/:FollowId", rate(5, 15), isLoggedIn, unfollowUser);
router.get("/like/:postId", rate(5, 20), isLoggedIn, isVerified, LikePost);
router.delete('/dislike/:postId', rate(5, 20), isLoggedIn, UnLikePost); 
router.post("/isfollowing", rate(15, 30), isLoggedIn, IsFollowing);

router.post("/likecount", rate(15, 30), PostLikes);

export default router;