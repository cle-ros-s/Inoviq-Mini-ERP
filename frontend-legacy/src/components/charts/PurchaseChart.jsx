import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  'Draft': '#CECECE',
  'Pending': '#C4761A',
  'Partially Received': '#D4A853',
  'Fully Received': '#2D7A45',
  'Cancelled': '#C0392B'
};

const PurchaseChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">No data available</div>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0D8CF" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} />
          <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#2C2420', fontWeight: 500 }} width={120} />
          <Tooltip 
            cursor={{ fill: '#F8F4F0' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(44,36,32,0.14)' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#8B5E3C'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PurchaseChart;
