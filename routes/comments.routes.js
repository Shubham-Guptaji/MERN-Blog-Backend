import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/comment', isLoggedIn);
router
    .route('/contact')
        .post(isLoggedIn)
        .delete(isLoggedIn)
        .get(isLoggedIn)
        .put(isLoggedIn)



export default router;