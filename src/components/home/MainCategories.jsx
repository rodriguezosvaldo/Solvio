import React from 'react'
import CategoryAndValue from './CategoryAndValue'
import TrendArrow from './TrendArrow'

const MainCategories = () => {
    return (
        <div className='grid grid-cols-2 grid-rows-5 gap-4 border border-white/60 rounded-3xl p-4 w-full h-full'>
            <div className='flex items-center justify-center rounded-3xl p-4'>
                <CategoryAndValue label='Rent' value='?' />
            </div>
            <div className='flex items-center justify-center rounded-3xl p-4'>
                <TrendArrow direction='up'/>
            </div>
            

            <div className='flex items-center justify-center rounded-3xl p-4'>
                <CategoryAndValue label='Food' value='?' />
            </div>
            <div className='flex items-center justify-center rounded-3xl p-4'>
                <TrendArrow direction='up'/>
            </div>
            

            <div className='flex items-center justify-center rounded-3xl p-4'>
                <CategoryAndValue label='Transport' value='?' />
            </div>
            <div className='flex items-center justify-center rounded-3xl p-4'>
                <TrendArrow direction='down'/>
            </div>
            
           
            <div className='flex items-center justify-center rounded-3xl p-4'>
                <CategoryAndValue label='Entertainment' value='?' />
            </div>
            <div className='flex items-center justify-center rounded-3xl p-4'>
                <TrendArrow direction='down'/>
            </div>
            

            <div className='flex items-center justify-center rounded-3xl p-4'>
                <CategoryAndValue label='Other' value='?' />
            </div>
            <div className='flex items-center justify-center rounded-3xl p-4'>
                <TrendArrow direction='down'/>
            </div>
        </div>
    )
}

export default MainCategories;
//Modify CategoryAndValue to show the categories with a bigger spending
//Modify TrendArrow to show the trend of the category