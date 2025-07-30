import React, { useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SolvioContext } from '../../context/SolvioContext';


const IncomeExpenseChart = () => { 
  const { totalExpenseAndIncomeByMonth } = useContext(SolvioContext);

  const renderChart = () => {
    if (totalExpenseAndIncomeByMonth.length > 0) {
      return (
        <ResponsiveContainer width="100%" height="100%">
      <LineChart
          data={totalExpenseAndIncomeByMonth.length > 0 ? totalExpenseAndIncomeByMonth : exampleData}
          margin={{
            top: 5,
            right: 20,
            left: 0,
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
      )
    } else {
      return (
        <div className='flex w-full h-full text-white justify-center items-center gap-8 rounded-3xl p-2'>
          <p>No data</p>
        </div>
      )
    }
  }
  

  return (
  <div className='bg-black flex flex-col gap-4 w-full h-full justify-center items-center border border-white/60 rounded-3xl p-4'>
    {renderChart()}
  </div>
  )
};

export default IncomeExpenseChart;