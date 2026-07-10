import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./src/config/database.js";
import router from "./src/routes/employee.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import leaveRouter from "./src/routes/leave-request.routes.js";
import leaveBalanceRouter from "./src/routes/leave-balance.routes.js";
import attendanceRouter from "./src/routes/attendance.routes.js";
import LeaveRequest from "./src/models/leave-request.model.js";
import LeaveBalance from "./src/models/leave-balance.model.js";
import Attendance from "./src/models/attendance.model.js";

dotenv.config();
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello Server");
});

app.use("/api/v1", router);
app.use("/api/auth", authRouter);
app.use("/api/v2", leaveRouter);
app.use("/api/v2", leaveBalanceRouter);
app.use("/api/v3", attendanceRouter);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
    await LeaveRequest.sync();
    console.log("✅ Leave requests table synced.");
    await LeaveBalance.sync();
    console.log("✅ Leave balances table synced.");
    await Attendance.sync({ alter: true });
    await sequelize.query(
      'ALTER TABLE "attendance" ALTER COLUMN "checkOutTime" DROP NOT NULL;',
    );
    console.log("✅ Attendance table synced.");
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

startServer();
