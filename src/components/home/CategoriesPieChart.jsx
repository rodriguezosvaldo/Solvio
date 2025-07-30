import React, { useContext } from 'react';
import { Pie, PieChart, ResponsiveContainer } from 'recharts';
import { SolvioContext } from '../../context/SolvioContext';

const CategoriesPieChart = () => {
    const { balanceByCatLastAndPreviousDate } = useContext(SolvioContext);

    // Get the top 5 expense categories
    const topExpenseCategories = [];
    for (let i = 0; i < 5; i++) {
      topExpenseCategories.push(balanceByCatLastAndPreviousDate[i]);
    }

    // This block of code is given by the recharts documentation to customize the label of the pie chart
    // The code customizes and places the label in the slice
    const RADIAN = Math.PI / 180;
    const customizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
      const x = cx - 3 + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
      const y = cy - 3 + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
      
      const textAnchor = x > cx ? 'start' : 'end';
      
      return (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={textAnchor} 
          dominantBaseline="central" 
          fontSize="13"
        >
          {`${((percent ?? 1) * 100).toFixed(0)}%`}
        </text>
      );
    };

    const renderChart = () => {
        if (balanceByCatLastAndPreviousDate.length > 0) {
            return (
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topExpenseCategories}
                  nameKey="categoryName"
                  dataKey="lastMonthBalance"
                  label={customizedLabel}
                  labelLine={false}
                  outerRadius={80}
                />
              </PieChart>
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
      <div className='bg-black flex flex-col w-full h-full justify-center items-center border border-white/60 rounded-3xl'>
        <div className='flex w-full h-full justify-center items-center p-2'>
          {renderChart()}
        </div>
      </div>
        
        
    );
};

export default CategoriesPieChart;