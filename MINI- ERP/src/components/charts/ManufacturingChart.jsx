import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  'Draft': '#CECECE',
  'Confirmed': '#1A6FA8',
  'In Progress': '#C4761A',
  'Completed': '#2D7A45',
  'Cancelled': '#C0392B'
};

const ManufacturingChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">No data available</div>;
  }

  return (
    <div className="h-72 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="count"
            nameKey="status"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#8B5E3C'} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(44,36,32,0.14)' }}
            formatter={(value) => [value, 'Orders']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ManufacturingChart;
