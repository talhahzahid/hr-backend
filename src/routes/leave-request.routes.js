import express from "express";
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  getEmployeeLeaves,
  getLeaveRequest,
  rejectLeaveRequest,
} from "../controllers/leave-request.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validateApproveLeaveRequest,
  validateCreateLeaveRequest,
  validateRejectLeaveRequest,
} from "../validators/leave-request.validation.js";

const router = express.Router();

router.use(protect);

router.post("/create", validateCreateLeaveRequest, createLeaveRequest);
router.get("/get-all", getLeaveRequest);
router.get("/employee/:employeeId/leaves", getEmployeeLeaves);
router.get("/leave-request/:id", getLeaveRequest);
router.patch(
  "/leave-request/:id/approve",
  validateApproveLeaveRequest,
  approveLeaveRequest,
);
router.patch(
  "/leave-request/:id/reject",
  validateRejectLeaveRequest,
  rejectLeaveRequest,
);
router.patch("/leave-request/:id/cancel", cancelLeaveRequest);

export default router;
