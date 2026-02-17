const express = require("express");
const router = express.Router();

const {
  createInvoice,
  getAllInvoices,
  deleteInvoice,
  updateInvoice
} = require("../controllers/invoiceController");

router.post("/", createInvoice);
router.get("/", getAllInvoices);
router.delete("/:id", deleteInvoice);
router.put("/:id", updateInvoice);


module.exports = router;