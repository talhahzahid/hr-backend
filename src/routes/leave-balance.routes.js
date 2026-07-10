import express from "express";
import {
  allocateLeaveBalances,
  getLeaveBalances,
} from "../controllers/leave-balance.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/employee/:employeeId/balances", getLeaveBalances);
router.post("/employee/:employeeId/allocate", allocateLeaveBalances);

export default router;
