import express from "express";
import {
  allocateLeaveBalances,
  getAllLeaveBalances,
  getLeaveBalances,
} from "../controllers/leave-balance.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/get-all-balances", getAllLeaveBalances);
router.get("/employee/:employeeId/balances", getLeaveBalances);
router.get("/employee/get-balance", getLeaveBalances);
router.post("/employee/:employeeId/allocate", allocateLeaveBalances);

export default router;
