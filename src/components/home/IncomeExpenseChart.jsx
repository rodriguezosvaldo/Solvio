import React, { useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SolvioContext } from '../../context/SolvioContext';


const IncomeExpenseChart = () => { 
  const { totalExpenseAndIncomeByMonth } = useContext(SolvioContext);
  
  return (
  <div className='flex flex-col gap-4 w-full h-full justify-center items-center border border-white/60 rounded-3xl p-4'>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
          data={totalExpenseAndIncomeByMonth}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="expense" stroke="red" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="income" stroke="green" />
      </LineChart>
    </ResponsiveContainer>
  </div>
  )
};

export default IncomeExpenseChart;