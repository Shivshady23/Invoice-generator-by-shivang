const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const customerRoutes = require("./routes/customerRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/customer", customerRoutes);
app.use("/invoice", invoiceRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
