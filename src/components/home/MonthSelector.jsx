import React from 'react'

const PeriodSelector = () => (
    <div className='flex justify-between items-center gap-4 w-30 h-10'>
        <button className='bg-amber-200 text-black px-4 py-2 rounded-full w-10 h-10'>
            <span>-</span>
        </button>
        <span className='text-white text-sm'>Period</span>
        <button className='bg-amber-200 text-black px-4 py-2 rounded-full w-10 h-10'>
            <span>+</span>
        </button>
    </div>
);

export default PeriodSelector;