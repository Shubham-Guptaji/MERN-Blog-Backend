import { Router } from "express";
import { isLoggedIn, autorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

router.route('/register').post();
router.route('/login').post();
router.route('/update').put(isLoggedIn);
router.route('/close').put(isLoggedIn, autorizeRoles('user'));
router.route('/profile').get(isLoggedIn);
router.route('/block-user').post(isLoggedIn, autorizeRoles('admin'));
router.route('/unblock-user').post(isLoggedIn, autorizeRoles('adimin'));
router.route('/delete').delete(isLoggedIn, autorizeRoles('admin'));
router.route("/reset/:id").put(isLoggedIn)

export default router;