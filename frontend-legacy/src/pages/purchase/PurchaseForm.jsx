import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as purchaseService from '../../services/purchaseService.js';
import * as productService from '../../services/productService.js';
import { useToast } from '../../hooks/useToast.js';
import Input from '../../components/ui/Input.jsx';
import DatePicker from '../../components/ui/DatePicker.jsx';
import { Trash2 } from 'lucide-react';

export default function PurchaseForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    vendorName: '', orderDate: new Date().toISOString().split('T')[0], lines: []
  });

  useEffect(() => {
    try { setProducts(productService.getProductsWithInventory()); } catch(e) { console.error(e); }
  }, []);

  const addLine = () => setFormData({ ...formData, lines: [...formData.lines, { productId: '', qty: 1, costPrice: 0, tax: 18 }]});
  const removeLine = (idx) => setFormData({ ...formData, lines: formData.lines.filter((_, i) => i !== idx) });
  
  const updateLine = (idx, field, val) => {
    const newLines = [...formData.lines];
    newLines[idx][field] = val;
    if (field === 'productId') {
      const p = products.find(x => x.id === val);
      if (p) newLines[idx].costPrice = p.costPrice;
    }
    setFormData({ ...formData, lines: newLines });
  };

  const calculateTotals = () => {
    let subtotal = 0, taxTotal = 0;
    formData.lines.forEach(line => {
      const base = line.qty * line.costPrice;
      const tax = base * (line.tax / 100);
      subtotal += base;
      taxTotal += tax;
    });
    return { subtotal, taxTotal, grandTotal: subtotal + taxTotal };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const po = await purchaseService.createPurchaseOrder({ ...formData, ...totals }, user.id);
      showSuccess('PO created');
      navigate(`/purchase/${po.id}`);
    } catch (err) {
      showError(err.message || 'Creation failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">New Purchase Order</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Vendor Name" required value={formData.vendorName} onChange={e => setFormData({...formData, vendorName: e.target.value})} />
          <DatePicker label="Expected Date" required value={formData.orderDate} onChange={e => setFormData({...formData, orderDate: e.target.value})} />
        </div>
        
        <div>
          <button type="button" onClick={addLine} className="btn btn-secondary btn-sm mb-2">+ Add Line</button>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-2">Product</th><th className="p-2">Qty</th><th className="p-2">Cost</th><th className="p-2">Tax %</th><th className="p-2">Total</th><th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {formData.lines.map((line, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">
                    <select className="border p-1 w-full" value={line.productId} onChange={e => updateLine(idx, 'productId', e.target.value)} required>
                      <option value="">Select...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="p-2"><input type="number" min="1" className="border p-1 w-16" value={line.qty} onChange={e => updateLine(idx, 'qty', Number(e.target.value))} required/></td>
                  <td className="p-2"><input type="number" min="0" className="border p-1 w-20" value={line.costPrice} onChange={e => updateLine(idx, 'costPrice', Number(e.target.value))}/></td>
                  <td className="p-2"><input type="number" min="0" max="100" className="border p-1 w-16" value={line.tax} onChange={e => updateLine(idx, 'tax', Number(e.target.value))}/></td>
                  <td className="p-2">{(line.qty * line.costPrice * (1 + line.tax/100)).toFixed(2)}</td>
                  <td className="p-2"><button type="button" onClick={() => removeLine(idx)}><Trash2 className="h-4 w-4 text-red-500"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create PO</button>
        </div>
      </form>
    </div>
  );
}
