import { Router } from "express";
import { isLoggedIn, authorizeRoles } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { CloseAccount, VerifyAccount, VerifyTokenEmail, blockUser, changePassword, forgotPassword, loginUser, registerUser, resetPassword, unBlockUser, userLogOut, userProfile } from "../controllers/user.controller.js";

const router = Router();

// router.route('/login').post();
// router.route('/update').put(isLoggedIn);
// router.route('/close').put(isLoggedIn, autorizeRoles('user'));
// router.route('/profile').get(isLoggedIn);
// router.route('/block-user').post(isLoggedIn, autorizeRoles('admin')); 
// router.route('/unblock-user').post(isLoggedIn, autorizeRoles('adimin'));
// router.route('/delete').delete(isLoggedIn, autorizeRoles('admin'));
// router.route("/reset/:id").put(isLoggedIn)

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', loginUser);
router.post('/logout', userLogOut);
router.post('/forgotpassword', forgotPassword);
router.post('/reset/:resetToken', resetPassword);
router.post("/change-password", isLoggedIn, changePassword);
router.get('/profile/:username', isLoggedIn, userProfile);
router.patch('/profile/:username/unblock', isLoggedIn, unBlockUser);
router.patch('/profile/:username/block', isLoggedIn, blockUser);
router.patch('/profile/:username/close', isLoggedIn, CloseAccount);
router.post('/verify/',isLoggedIn, VerifyTokenEmail);
router.patch('/profile/:username/verify/:token',VerifyAccount)


export default router;