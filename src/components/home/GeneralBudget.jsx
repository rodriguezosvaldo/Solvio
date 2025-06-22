import React from 'react'
import TrendArrow from './TrendArrow'
import CategoryAndValue from './CategoryAndValue'

const GeneralBudget = () => {
    return (
        <div className='grid grid-cols-2 grid-rows-3 gap-4 border border-white/60 rounded-3xl p-4 w-full h-full'>
            <div className='flex items-center justify-center'>
                <CategoryAndValue label='Assets' value='?' />
            </div>
            <div className='flex items-center justify-center'>
                <TrendArrow direction='up' />
            </div>
            

            <div className='flex items-center justify-center'>
                <CategoryAndValue label='Liabilities' value='?' />
            </div>
            <div className='flex items-center justify-center'>
                <TrendArrow direction='up' />
            </div>
            
            
            <div className='flex items-center justify-center'>
                <CategoryAndValue label='Total' value='?' />
            </div>
            <div className='flex items-center justify-center'>
                <TrendArrow direction='down' />
            </div>
        </div>
    )
};

export default GeneralBudget
