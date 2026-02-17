const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Counter = require("../models/Counter");

const INVOICE_COUNTER_ID = "invoiceNumber";
const INVOICE_PREFIX = "IN";
const INVOICE_PADDING = 3;

const parseInvoiceSequence = (invoiceNumber = "") => {
  const match = invoiceNumber.match(/^IN(\d+)$/);
  return match ? Number(match[1]) : 0;
};

const buildInvoiceNumber = (sequence) =>
  `${INVOICE_PREFIX}${String(sequence).padStart(INVOICE_PADDING, "0")}`;

const ensureInvoiceCounter = async () => {
  const existingCounter = await Counter.findById(INVOICE_COUNTER_ID);
  if (existingCounter) return;

  const latestInvoice = await Invoice.findOne({
    invoiceNumber: { $regex: /^IN\d+$/ }
  }).sort({ createdAt: -1, _id: -1 });

  const initialSeq = latestInvoice
    ? parseInvoiceSequence(latestInvoice.invoiceNumber)
    : 0;

  await Counter.findByIdAndUpdate(
    INVOICE_COUNTER_ID,
    { $setOnInsert: { seq: initialSeq } },
    { upsert: true, new: true }
  );
};

const getNextInvoiceNumber = async () => {
  await ensureInvoiceCounter();

  const counter = await Counter.findByIdAndUpdate(
    INVOICE_COUNTER_ID,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return buildInvoiceNumber(counter.seq);
};

exports.getNextInvoiceNumberPreview = async (_req, res) => {
  try {
    await ensureInvoiceCounter();

    const counter = await Counter.findById(INVOICE_COUNTER_ID);
    const previewNumber = buildInvoiceNumber((counter?.seq || 0) + 1);

    res.json({ invoiceNumber: previewNumber });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate invoice number preview" });
  }
};

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

    const invoiceData = { ...req.body };
    invoiceData.invoiceNumber = await getNextInvoiceNumber();

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.json({ message: "Invoice & Customer saved successfully", invoice });
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
    const updatePayload = { ...req.body };
    delete updatePayload.invoiceNumber;

    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};
