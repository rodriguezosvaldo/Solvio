import React, { useState } from 'react'

const MonthYearSelector = () => {

    const [period, setPeriod] = useState('M');

    return (
        <button className='flex w-10 h-10 justify-center items-center bg-green-200/20 rounded-3xl p-2 hover:scale-110 transition-all duration-100'
        onClick={() => {
            setPeriod(period === 'M' ? 'Y' : 'M');
        }}>
            <span className='text-white text-lg font-bold'>{period}</span>
        </button>
    )
};

export default MonthYearSelector;