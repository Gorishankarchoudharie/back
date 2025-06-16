// 📁 backend/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const transfer = require("./piTransfer");
const balanceChecker = require("./balanceChecker");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let statusLog = [];

app.get("/api/status", (req, res) => {
  res.json(statusLog);
});

app.post("/api/check-balance", async (req, res) => {
  const { passphrase } = req.body;
  const balance = await balanceChecker(passphrase);
  res.json({ balance });
});

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
  transfer(statusLog); // Start retry system
});
