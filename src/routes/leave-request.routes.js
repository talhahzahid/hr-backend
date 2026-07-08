import express from "express";
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  getLeaveRequest,
  rejectLeaveRequest,
} from "../controllers/leave-request.controller.js";
import {
  validateApproveLeaveRequest,
  validateCreateLeaveRequest,
  validateRejectLeaveRequest,
} from "../validators/leave-request.validation.js";

const router = express.Router();

router.post("/create", createLeaveRequest, (req, res) => {
  console.log(req);
});
router.get("/get-all", getLeaveRequest);
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
