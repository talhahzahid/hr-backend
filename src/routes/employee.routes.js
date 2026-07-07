import express from "express";
import {
  createEmployee,
  getEmployee,
} from "../controllers/employee.controller.js";

const router = express.Router();

router.post("/create", createEmployee);
router.get("/get-all", getEmployee);
router.get("/employee/:id", getEmployee);
// router.put("/:id", updateEmployee);
// router.delete("/:id", deleteEmployee);

export default router;
