import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as productService from '../../services/productService.js';
import { useToast } from '../../hooks/useToast.js';
// (assuming ProductForm is refactored to be reusable or we just duplicate structure for edit as requested)
export default function ProductEdit() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await productService.getProductById(id);
        setFormData(p);
      } catch (err) {
        showError('Failed to load product');
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productService.updateProduct(id, formData, user.id);
      showSuccess('Product updated');
      navigate(`/products/${id}`);
    } catch (err) {
      showError(err.message || 'Update failed');
    }
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-lg space-y-4">
        {/* Same fields as ProductForm */}
        <div className="flex justify-end space-x-2">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
