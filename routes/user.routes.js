import { Router } from "express";
import { isAdmin, isLoggedIn, isVerified } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { AllUsers, CloseAccount, DeleteUser, VerifyAccount, VerifyTokenEmail, blockUser, changePassword, forgotPassword, loginUser, refreshAccessToken, registerUser, resetPassword, unBlockUser, updateProfile, userLogOut, userProfile } from "../controllers/user.controller.js";
import rate from "../utils/requestLimit.js";

const router = Router();

router.post('/register', rate(15 * 60 * 1000, 10), upload.single('avatar'), registerUser);
router.post('/login', rate(15 * 60 * 1000, 10), loginUser);
router.post('/logout', rate(60 * 60 * 1000, 25), isLoggedIn, userLogOut);
router.post('/refresh-token', rate(15 * 60 * 1000, 5), refreshAccessToken);
router.post('/forgot-password', rate(15 * 60 * 1000, 5), forgotPassword);
router.post('/reset/:resetToken', rate(15 * 60 * 1000, 10), resetPassword);
router.post("/change-password", rate(60 * 60 * 1000, 10), isLoggedIn, changePassword);
router.get('/profile/:username', rate(15 * 60 * 1000, 30), isLoggedIn, userProfile);
router.patch('/profile/:id/unblock', rate(60 * 60 * 1000, 35), isLoggedIn, isAdmin, unBlockUser);
router.patch('/profile/:id/block', rate(60 * 60 * 1000, 35), isLoggedIn, isAdmin, blockUser);
router.patch('/profile/close', rate(60 * 60 * 1000, 5), isLoggedIn, CloseAccount);
router.post('/verify/', rate(60 * 60 * 1000, 10), isLoggedIn, VerifyTokenEmail);
router.patch('/profile/:username/verify/:token', rate(60 * 60 * 1000, 5), VerifyAccount)
router.patch('/profile', rate(60 * 60 * 1000, 8) , isLoggedIn, upload.single('avatar'), updateProfile);
router.delete('/profile/:id', rate(60 * 60 * 1000, 35), isLoggedIn, DeleteUser);
router.get('/profile', rate(60 * 60 * 1000, 35), isLoggedIn, isAdmin, AllUsers);


export default router;