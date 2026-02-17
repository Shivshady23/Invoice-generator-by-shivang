const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  customerMobileNumber: String,
  customerName: String,
  customerAddress: String,
  gstNumber: String,

  products: [
    {
      product: String,
      rate: Number,
      quantity: Number,
      total: Number
    }
  ],

  gstSlab: Number,
  totalAmount: Number,
  amountInWords: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Invoice", invoiceSchema);
