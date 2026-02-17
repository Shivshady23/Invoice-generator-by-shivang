import { useState, useEffect } from "react";
import api from "../api/api";
import "../InvoiceForm.css";

function InvoiceForm({ existingInvoice, onClose }) {
  // ================= CUSTOMER =================
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);

  // ================= PRODUCTS =================
  const [products, setProducts] = useState([
    { product: "", rate: 0, quantity: 0, total: 0 }
  ]);

  // ================= GST =================
  const [gstSlab, setGstSlab] = useState(5);

  // ================= PREFILL (EDIT) =================
  useEffect(() => {
    if (existingInvoice) {
      setInvoiceNumber(existingInvoice.invoiceNumber);
      setMobile(existingInvoice.customerMobileNumber);
      setName(existingInvoice.customerName);
      setAddress(existingInvoice.customerAddress);
      setGstNumber(existingInvoice.gstNumber);
      setProducts(existingInvoice.products);
      setGstSlab(existingInvoice.gstSlab);
      setIsExistingCustomer(true);
      return;
    }

    const fetchNextInvoiceNumber = async () => {
      try {
        const res = await api.get("/invoice/next-number");
        setInvoiceNumber(res.data.invoiceNumber || "");
      } catch {
        setInvoiceNumber("");
      }
    };

    fetchNextInvoiceNumber();
  }, [existingInvoice]);

  // ================= FETCH CUSTOMER =================
  const fetchCustomer = async (value) => {
    setMobile(value);

    if (value.length !== 10) {
      setIsExistingCustomer(false);
      setName("");
      setAddress("");
      setGstNumber("");
      return;
    }

    try {
      const res = await api.get(`/customer/${value}`);
      setName(res.data.customerName);
      setAddress(res.data.customerAddress);
      setGstNumber(res.data.gstNumber);
      setIsExistingCustomer(true);
    } catch {
      setIsExistingCustomer(false);
      setName("");
      setAddress("");
      setGstNumber("");
    }
  };

  // ================= PRODUCT HANDLING =================
  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;

    if (field === "rate" || field === "quantity") {
      updated[index].total =
        updated[index].rate * updated[index].quantity;
    }

    setProducts(updated);
  };

  const addProductRow = () => {
    setProducts([...products, { product: "", rate: 0, quantity: 0, total: 0 }]);
  };

  const deleteProductRow = (index) => {
    if (products.length === 1) {
      alert("At least one product required 😤");
      return;
    }
    setProducts(products.filter((_, i) => i !== index));
  };

  // ================= TOTAL =================
  const totalAmount = products.reduce((sum, p) => sum + p.total, 0);
  const finalAmount = totalAmount + (totalAmount * gstSlab) / 100;

  // ================= NUMBER TO WORDS =================
  const numberToWords = (num) => {
    const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
      "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

    if (num === 0) return "Zero";
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + " " + ones[num%10];
    if (num < 1000) return ones[Math.floor(num/100)] + " Hundred " + numberToWords(num%100);
    if (num < 100000) return numberToWords(Math.floor(num/1000)) + " Thousand " + numberToWords(num%1000);
    if (num < 10000000) return numberToWords(Math.floor(num/100000)) + " Lakh " + numberToWords(num%100000);
    return numberToWords(Math.floor(num/10000000)) + " Crore " + numberToWords(num%10000000);
  };
  
  const handlePrint = () => {
    window.print();
  };

  const amountInWords =
    finalAmount > 0 ? numberToWords(Math.floor(finalAmount)) + " Only" : "";

  // ================= SAVE =================
  const saveInvoice = async () => {
    const payload = {
      customerMobileNumber: mobile,
      customerName: name,
      customerAddress: address,
      gstNumber,
      products,
      gstSlab,
      totalAmount: finalAmount,
      amountInWords,
      ...(existingInvoice ? { invoiceNumber } : {})
    };

    if (existingInvoice) {
      await api.put(`/invoice/${existingInvoice._id}`, payload);
      alert("Invoice Updated 😎");
      onClose();
    } else {
      const res = await api.post("/invoice", payload);
      setInvoiceNumber(res.data?.invoice?.invoiceNumber || invoiceNumber);
      alert("Invoice Saved 😎");
    }
  };

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <img src="/Logo.png" alt="Chauhan Industry" className="invoice-logo" />
      </div>
      <div className="top-section">
        <label>Invoice Number:</label>
        <input
          value={invoiceNumber}
          readOnly
        />

        <label>Customer Mobile Number:</label>
        <input value={mobile} onChange={e => fetchCustomer(e.target.value)} />

        <label>Name:</label>
        <input value={name} readOnly={isExistingCustomer} onChange={e => setName(e.target.value)} />

        <label>Address:</label>
        <input value={address} readOnly={isExistingCustomer} onChange={e => setAddress(e.target.value)} />

        <label>GST Number:</label>
        <input value={gstNumber} readOnly={isExistingCustomer} onChange={e => setGstNumber(e.target.value)} />
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Rate</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={i}>
              <td><input value={p.product} onChange={e => handleProductChange(i,"product",e.target.value)} /></td>
              <td><input type="number" value={p.rate} onChange={e => handleProductChange(i,"rate",+e.target.value)} /></td>
              <td><input type="number" value={p.quantity} onChange={e => handleProductChange(i,"quantity",+e.target.value)} /></td>
              <td><input value={p.total} readOnly /></td>
              <td><button className="delete-btn" onClick={() => deleteProductRow(i)}>DELETE</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-btn" onClick={addProductRow}>+ Add Product</button>

      <div className="gst-section">
        <label>GST Slab:</label>
        <select value={gstSlab} onChange={e => setGstSlab(+e.target.value)}>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
        </select>

        <label>Total:</label>
        <input value={finalAmount} readOnly />
      </div>

      <div className="words-section">
        <label>Amount in words:</label>
        <input value={amountInWords} readOnly />
      </div>

      <div className="action-buttons">
        <button className="save-btn" onClick={saveInvoice}>SAVE</button>
        <button className="list-btn" onClick={onClose}>LIST</button>
        <button className="print-btn" onClick={handlePrint}>
          PRINT / SAVE PDF
        </button>
      </div>

    </div>
  );
}

export default InvoiceForm;
