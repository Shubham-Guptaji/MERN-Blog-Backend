import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware";

const router = Router();

router
    .route('/blog')
        .post(isLoggedIn)
        .put(isLoggedIn)
        .get(isLoggedIn)
        .delete(isLoggedIn)

export default router;