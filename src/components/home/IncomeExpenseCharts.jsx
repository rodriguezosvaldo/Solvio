import React from 'react'
import PeriodSelector from './PeriodSelector'
import LineChart from './LineChart'

const IncomeExpenseCharts = () => {

    return (
        <div className='flex flex-col gap-4 w-full h-full justify-center items-center border border-white/60 rounded-3xl p-4'>
            <PeriodSelector />
            <LineChart />    {/* Income */}
            <LineChart />    {/* Expense */}
        </div>
    )
};   

export default IncomeExpenseCharts;