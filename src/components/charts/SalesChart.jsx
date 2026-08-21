import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SalesChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">No sales data available</div>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0D8CF" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} dy={10} />
          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} dx={-10} />
          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} dx={10} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(44,36,32,0.14)' }}
            cursor={{ stroke: '#C8BDB0', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line yAxisId="left" type="monotone" dataKey="orders" name="Orders Count" stroke="#8B5E3C" strokeWidth={3} dot={{ r: 4, fill: '#8B5E3C', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="value" name="Revenue (₹)" stroke="#D4A853" strokeWidth={3} dot={{ r: 4, fill: '#D4A853', strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
