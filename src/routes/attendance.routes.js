import express from "express";
import {
  checkIn,
  checkOut,
  getAttendance,
} from "../controllers/attendance.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validateCheckIn,
  validateCheckOut,
} from "../validators/attendance.validation.js";

const router = express.Router();

router.use(protect);

router.post("/check-in", validateCheckIn, checkIn);
router.patch("/attendance/:id/check-out", validateCheckOut, checkOut);
router.get("/get-all", getAttendance);
router.get("/attendance/:id", getAttendance);

export default router;
