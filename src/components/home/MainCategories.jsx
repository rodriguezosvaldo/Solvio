import React, { useState, useEffect, useContext } from 'react'
import CategoryAndValue from './CategoryAndValue'
import TrendArrow from './TrendArrow'
import { SolvioContext } from '../../context/SolvioContext'

const MainCategories = () => {
    const { balanceByCategoryLastDateInDatabase } = useContext(SolvioContext);

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

    return (
        <div className='flex flex-col border border-white/60 rounded-3xl p-4 w-full h-full'>
            {balanceByCategoryLastDateInDatabase.map(category => {
                return (
                    <div key={category.categoryId} className='flex flex-row items-center justify-center rounded-3xl p-4 w-full'>
                        <div className='flex items-center justify-center rounded-3xl p-4 w-full'>
                            <CategoryAndValue 
                            label={category.categoryName} 
                            value={category.lastMonthBalance}
                            color={category.fill}
                            />
                        </div>
                        <div className='flex items-center justify-center rounded-3xl p-4'>
                            <TrendArrow 
                                popUpMessage={trendArrowReference(category).popUpMessage}
                                reference={trendArrowReference(category).reference}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )

}

export default MainCategories;
//Modify CategoryAndValue to show the categories with a bigger spending
