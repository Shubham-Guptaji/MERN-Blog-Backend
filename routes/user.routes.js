import { Router } from "express";
import { isAdmin, isLoggedIn, isVerified } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { AllUsers, CloseAccount, DeleteUser, GetRegisteredUser, VerifyAccount, VerifyTokenEmail, authChartData, blockUser, changePassword, forgotPassword, googleAuth, loginUser, refreshAccessToken, registerUser, resetPassword, unBlockUser, updateBgImage, updateProfile, userLogOut, userProfile } from "../controllers/user.controller.js";
import rate from "../middlewares/requestLimit.js";

const router = Router();

router.post('/register', rate(15, 5), upload.single('avatar'), registerUser);
router.post('/login', rate(10, 10), loginUser);
router.post('/logout', rate(10, 10), isLoggedIn, userLogOut);
router.post('/refresh-token', rate(15, 10), refreshAccessToken);
router.post('/forgot-password', rate(60, 5), forgotPassword);
router.post('/reset/:resetToken', rate(60, 5), resetPassword);
router.post("/change-password", rate(60, 5), isLoggedIn, isVerified, changePassword);
router.post('/profile/:username', rate(15, 30), isLoggedIn, userProfile);
router.patch('/profile/:id/unblock', rate(60, 30), isLoggedIn, isAdmin, unBlockUser);
router.patch('/profile/:id/block', rate(60, 30), isLoggedIn, isAdmin, blockUser);
router.patch('/profile/close', rate(60, 5), isLoggedIn, CloseAccount);
router.post('/verify/', rate(60, 5), isLoggedIn, VerifyTokenEmail);
router.patch('/profile/:username/verify/:token', rate(60, 5), VerifyAccount)
router.patch('/profile', rate(60, 8) , isLoggedIn, upload.single('avatar'), updateProfile);
router.post('/backgroundImage', rate(60, 5), isLoggedIn, isVerified, upload.single('bgImage'), updateBgImage);
router.delete('/profile/:id', rate(60, 15), isLoggedIn, DeleteUser);
router.get('/profile', rate(5, 25), isLoggedIn, isAdmin, AllUsers);
router.get('/profile/chartdata', rate(15, 30), isLoggedIn, authChartData);
router.get('/profile/search', rate(60, 40), isLoggedIn, isAdmin, GetRegisteredUser);

router.get('/google/auth', rate(10, 10), googleAuth);


export default router;