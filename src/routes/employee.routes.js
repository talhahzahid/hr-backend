import express from "express";
import {
  createEmployee,
  getEmployee,
} from "../controllers/employee.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", createEmployee);
router.get("/get-all", protect, getEmployee);
router.get("/employee/:id", protect, getEmployee);

export default router;
