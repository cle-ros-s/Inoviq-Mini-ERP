import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const data = [
    { name: 'Jan', sales: 4000, po: 2400 },
    { name: 'Feb', sales: 3000, po: 1398 },
    { name: 'Mar', sales: 2000, po: 9800 }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="bg-white p-4 rounded shadow h-96">
        <h3 className="font-bold mb-4">Overview (Stub)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#3b82f6" />
            <Bar dataKey="po" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
