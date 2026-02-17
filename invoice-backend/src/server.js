require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const customerRoutes = require("./routes/customerRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

const frontendUrl = process.env.FRONTEND_URL;
const corsOptions = frontendUrl
  ? { origin: frontendUrl.split(",").map((url) => url.trim()) }
  : {};

app.use(cors(corsOptions));
app.use(express.json());

connectDB();

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/customer", customerRoutes);
app.use("/invoice", invoiceRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
