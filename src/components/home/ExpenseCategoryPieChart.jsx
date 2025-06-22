import React from 'react'
import PeriodSelector from './PeriodSelector'
import PieChart from './PieChart'


const ExpenseCategoryPieChart = () => {

    return (
    <div className='flex flex-col gap-4 w-full h-full justify-center items-center border border-white/60 rounded-3xl p-4'>
        <PeriodSelector />
        <PieChart />
    </div>
    );
}

export default ExpenseCategoryPieChart;