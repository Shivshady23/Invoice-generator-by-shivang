const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");

exports.createInvoice = async (req, res) => {
  try {
    const {
      customerMobileNumber,
      customerName,
      customerAddress,
      gstNumber
    } = req.body;

    let customer = await Customer.findOne({
      mobileNumber: customerMobileNumber
    });

    if (!customer) {
      customer = new Customer({
        mobileNumber: customerMobileNumber,
        customerName,
        customerAddress,
        gstNumber
      });
      await customer.save();
    }

    const invoice = new Invoice(req.body);
    await invoice.save();

    res.json({ message: "Invoice & Customer saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving invoice" });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};
