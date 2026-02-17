const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  mobileNumber: String,
  customerName: String,
  customerAddress: String,
  gstNumber: String
});

module.exports = mongoose.model("Customer", customerSchema);
