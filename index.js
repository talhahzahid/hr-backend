import express from "express";
import dotenv from "dotenv";
import { sequelize } from "./src/config/database.js";
import router from "./src/routes/employee.routes.js";
import leaveRouter from "./src/routes/leave-request.routes.js";
import LeaveRequest from "./src/models/leave-request.model.js";

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello Server");
});

app.use("/api/v1", router);
app.use("/api/v2", leaveRouter);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
    await LeaveRequest.sync();
    console.log("✅ Leave requests table synced.");
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

startServer();
