import React from 'react'
import TrendArrow from './TrendArrow'

const GeneralBudget = () => {


    return (
        <div className='grid grid-cols-2 gap-4'>
            <div className='bg-blue-500 flex flex-col gap-4 w-full h-full p-4 rounded-3xl'>
                <CategoryAndValue label='Assets' value='?' />
                <CategoryAndValue label='Liabilities' value='?' />
                <CategoryAndValue label='Total' value='?' />

            </div>
            <div className='bg-red-500 flex flex-col gap-4 w-full h-full p-4 rounded-3xl'>
                <TrendArrow direction='down' color='#16a34a' />
                <TrendArrow direction='down' color='#16a34a' />
                <TrendArrow direction='down' color='#16a34a' />
            </div>
        </div>
    )
};

export default GeneralBudget
