const Customer = require("../models/Customer");

exports.getCustomerByMobile = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      mobileNumber: req.params.mobile
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
