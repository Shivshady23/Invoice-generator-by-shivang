const express = require("express");
const router = express.Router();

const {
  createInvoice,
  getNextInvoiceNumberPreview,
  getAllInvoices,
  deleteInvoice,
  updateInvoice
} = require("../controllers/invoiceController");

router.get("/next-number", getNextInvoiceNumberPreview);
router.post("/", createInvoice);
router.get("/", getAllInvoices);
router.delete("/:id", deleteInvoice);
router.put("/:id", updateInvoice);


module.exports = router;
