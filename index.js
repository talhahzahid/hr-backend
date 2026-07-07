import express from "express";
import dotenv from "dotenv";
const app = express();
const port = 8000;

app.get("/", (req, res) => {
  res.send("Hello Server");
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
