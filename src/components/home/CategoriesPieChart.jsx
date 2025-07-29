import React, { useContext } from 'react';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { SolvioContext } from '../../context/SolvioContext';

const CategoriesPieChart = () => {
    const { balanceByCategoryLastDateInDatabase } = useContext(SolvioContext);

    // Get the top 5 expense categories
    const topExpenseCategories = [];
    for (let i = 0; i < 5; i++) {
      topExpenseCategories.push(balanceByCategoryLastDateInDatabase[i]);
    }

    // This block of code is given by the recharts documentation to customize the label of the pie chart
    // The code customizes and places the label in the slice
    const RADIAN = Math.PI / 180;
    const customizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
      const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
      return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
          {`${((percent ?? 1) * 100).toFixed(0)}%`}
        </text>
      );
    };

    return (
      <div className='flex flex-col gap-4 w-full h-full justify-center items-center border border-white/60 rounded-3xl p-4'>
       <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topExpenseCategories}
              nameKey="categoryName"
              dataKey="lastMonthBalance"
              label={customizedLabel}
              labelLine={false}
            />
          <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
        
        
    );
};

export default CategoriesPieChart;