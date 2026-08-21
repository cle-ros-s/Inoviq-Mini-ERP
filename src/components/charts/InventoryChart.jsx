import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const InventoryChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">No inventory data available</div>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={30}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0D8CF" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} />
          <Tooltip 
            cursor={{ fill: '#F8F4F0' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(44,36,32,0.14)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="freeToUse" name="Free to Use" stackId="a" fill="#2D7A45" radius={[0, 0, 4, 4]} isAnimationActive={true} animationDuration={600} />
          <Bar dataKey="reserved" name="Reserved" stackId="a" fill="#C4761A" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryChart;
