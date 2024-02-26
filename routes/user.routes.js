import { Router } from "express";
import { isLoggedIn, authorizeRoles } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { CloseAccount, VerifyAccount, VerifyTokenEmail, blockUser, changePassword, forgotPassword, loginUser, registerUser, resetPassword, unBlockUser, updateProfile, userLogOut, userProfile } from "../controllers/user.controller.js";

const router = Router();

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', loginUser);
router.post('/logout', userLogOut);
router.post('/forgotpassword', forgotPassword);
router.post('/reset/:resetToken', resetPassword);
router.post("/change-password", isLoggedIn, changePassword);
router.get('/profile/:username', isLoggedIn, userProfile);
router.patch('/profile/:id/unblock', isLoggedIn, unBlockUser);
router.patch('/profile/:id/block', isLoggedIn, blockUser);
router.patch('/profile/:id/close', isLoggedIn, CloseAccount);
router.post('/verify/',isLoggedIn, VerifyTokenEmail);
router.patch('/profile/:username/verify/:token',VerifyAccount)
router.patch('/profile', isLoggedIn, upload.single('avatar'), updateProfile)


export default router;