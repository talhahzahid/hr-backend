import express from "express";
import dotenv from "dotenv";
import { sequelize } from "./src/config/database.js";
import router from "./src/routes/employee.routes.js";
const app = express();
const port = 8000;

app.get("/", (req, res) => {
  res.send("Hello Server");
});

app.use("/api/v1", router);

// app.listen(port, () => {
//   console.log(`server is running at port ${port}`);
// });

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
    // Sync models (optional)
    // await sequelize.sync();
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

startServer();
