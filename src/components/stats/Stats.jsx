import React from 'react'
import MonthYearSelector from './MonthYearSelector'
import PeriodSelector from '../home/PeriodSelector'
import PieChart from '../home/PieChart'
import LineChart from '../home/LineChart'


const Stats = () => {
    return (
        <div className='flex flex-col gap-20 text-white p-6 w-full h-full border-2 border-yellow-500 rounded-3xl'>
            <div className='flex w-full h-10 justify-end items-center space-x-60'>
                <PeriodSelector />
                <MonthYearSelector />
            </div>
            <div className='flex flex-col w-full h-full gap-8 justify-center items-center'>
                <PieChart />
                <LineChart />
            </div>
        </div>
    )
}

export default Stats 