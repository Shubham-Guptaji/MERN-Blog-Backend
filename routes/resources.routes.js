import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware";

const router = Router();

router.post("/" ,isLoggedIn, upload.single('resource'), AddResource);
router.delete("/:id", isLoggedIn, DeleteResource);

export default router;