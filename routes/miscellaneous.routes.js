import { Router } from "express";
import { UnLikePost, LikePost, contactformHandler, followUser, unfollowUser, userFollowers, UserFollowing, AllContacts, DeleteContact } from "../controllers/miscellaneous.controllers.js";
import { isAdmin, isLoggedIn, isVerified } from "../middlewares/auth.middleware.js";
import rate from "../utils/requestLimit.js";

const router = Router(); 

router.post("/contact", rate(15*60*1000, 5), contactformHandler);
router.get("/contact", rate(15*60*1000, 15), isLoggedIn, isVerified, isAdmin, AllContacts);
router.delete("/contact/:id", rate(15*60*1000, 50), isLoggedIn, isAdmin, DeleteContact);
router.get("/followers", rate(15*60*1000, 10), isLoggedIn, userFollowers);
router.get("/following", rate(15*60*1000, 25), isLoggedIn, isVerified, UserFollowing);
router.post("/follower/follow", rate(15*60*1000, 15), isLoggedIn, isVerified, followUser);
router.delete("/follower/unfollow/:FollowId", rate(15*60*1000, 15), isLoggedIn, unfollowUser)
router.get("/like/:postId", rate(5*60*1000, 20), isLoggedIn, isVerified, LikePost);
router.delete('/dislike/:postId', rate(5*60*1000, 20), isLoggedIn, UnLikePost); 

export default router;