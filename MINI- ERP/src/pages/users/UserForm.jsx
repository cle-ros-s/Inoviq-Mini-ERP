import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as userService from '../../services/userService.js';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UserForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'sales', active: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.createUser(formData, user.id);
      showSuccess('User created');
      navigate('/users');
    } catch (err) {
      showError(err.message || 'Failed to create');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">New User</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-lg space-y-4">
        <Input label="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <Input label="Email" required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        <Input label="Password" required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        <Select label="Role" options={[
          {value:'admin',label:'Admin'},{value:'sales',label:'Sales'},
          {value:'purchase',label:'Purchase'},{value:'manufacturing',label:'Manufacturing'},
          {value:'inventory',label:'Inventory'},{value:'owner',label:'Owner'}
        ]} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
        
        <div className="flex justify-end space-x-2">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create User</button>
        </div>
      </form>
    </div>
  );
}
