import React, { useContext } from 'react'
import CategoryAndValue from './CategoryAndValue'
import TrendArrow from './TrendArrow'
import { SolvioContext } from '../../context/SolvioContext'

const MainCategories = () => {
    const { balanceByCatLastAndPreviousDate } = useContext(SolvioContext);

    // Get pop up message and reference for the trend arrow
    const trendArrowReference = (category) => {
        if (category.categoryType === "expense") {
            if (category.difference > 0) {
                const reference = 0;
                const popUpMessage = `Sorry! You have spent ${category.difference} more than last month`; // This is going to be a pop up message when hovering the arrow
                return {reference, popUpMessage};
            } else {
                const reference = 1;
                const popUpMessage = `Congratulations! You have spent ${Math.abs(category.difference)} less than last month`; // This is going to be a pop up message when hovering the arrow
                return {reference, popUpMessage};
            }
        } else {
            if (category.difference > 0) {
                const reference = 1;
                const popUpMessage = `You have earned ${category.difference} more than last month`; // This is going to be a pop up message when hovering the arrow
                return {reference, popUpMessage};
            } else {
                const reference = 0;
                const popUpMessage = `You have earned ${Math.abs(category.difference)} less than last month`; // This is going to be a pop up message when hovering the arrow
                return {reference, popUpMessage};
            }
        }
    }

    const renderCategories = () => {
        if (balanceByCatLastAndPreviousDate.length > 0) {
            return balanceByCatLastAndPreviousDate.map(category => {
                return (
                    <div key={category.categoryId} className='flex w-full h-full justify-center items-center gap-2 rounded-3xl p-2'>
                            <CategoryAndValue 
                            label={(category.categoryName).charAt(0).toUpperCase() + (category.categoryName).slice(1).toLowerCase()} 
                            value={category.lastMonthBalance}
                            color={category.fill}
                            />

                            <TrendArrow 
                                popUpMessage={trendArrowReference(category).popUpMessage}
                                reference={trendArrowReference(category).reference}
                            />
                    </div>
                )
            })
        } else {    
            return (
                <div className='flex w-full h-full text-white justify-center items-center gap-8 rounded-3xl p-2'>
                    <p>No data</p>
                </div>
            )
        }
    }

    return (
        <div className='bg-black max-sm:text-xs max-sm:px-2 max-sm:py-2 max-sm:gap-2 flex flex-col w-full h-full gap-8 px-4 py-6 border border-white/60 rounded-3xl overflow-y-auto scrollbar-hide'>
            {renderCategories()}
        </div>
    )

}

export default MainCategories;
