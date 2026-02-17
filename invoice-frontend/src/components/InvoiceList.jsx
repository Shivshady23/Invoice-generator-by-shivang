import { useEffect, useState } from "react";
import api from "../api/api";
import InvoiceForm from "./InvoiceForm";
import "./InvoiceList.css";

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const res = await api.get("/invoice");
    setInvoices(res.data);
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete invoice? 😈")) return;
    await api.delete(`/invoice/${id}`);
    setInvoices(invoices.filter(inv => inv._id !== id));
  };

  if (!showList) {
    return (
      <InvoiceForm
        existingInvoice={editingInvoice}
        onClose={() => {
          setEditingInvoice(null);
          setShowList(true);
        }}
      />
    );
  }
  return (
    <div className="list-container">
      <h2>Invoice List</h2>
      <button
        className="add-btn"
        onClick={() => {
          setEditingInvoice(null);
          setShowList(false);
        }}
      >
        + New Invoice
      </button>

      <table className="invoice-list-table">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Customer</th>
            <th>Mobile</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv._id}>
              <td>{inv.invoiceNumber}</td>
              <td>{inv.customerName}</td>
              <td>{inv.customerMobileNumber}</td>
              <td>{inv.totalAmount}</td>
              <td>
                <button className="edit-btn" onClick={() => { setEditingInvoice(inv); setShowList(false);}}>Edit</button>
                <button className="delete-btn-list" onClick={() => deleteInvoice(inv._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InvoiceList;
