import express from "express";
import { getProfile, login } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateLogin } from "../validators/auth.validation.js";

const router = express.Router();

router.post("/login", validateLogin, login);
router.get("/profile", protect, getProfile);

export default router;
