import React, { useState, useEffect, useContext } from 'react'
import CategoryAndValue from './CategoryAndValue'
import TrendArrow from './TrendArrow'
import { SolvioContext } from '../../context/SolvioContext'

const MainCategories = () => {

    const { transactionsInDatabase, categoriesInDatabase } = useContext(SolvioContext);
    const [balanceByCategoryLastDateInDatabase, setBalanceByCategoryLastDateInDatabase] = useState([]);

    // Getting balanceByCategoryToday 
    useEffect(() => {
        if (transactionsInDatabase.length > 0 && categoriesInDatabase.length > 0) {
            const categoriesNotTransfer = categoriesInDatabase.filter(category => category.categoryType !== "transfer"); 
            const transactionsNotTransfer = transactionsInDatabase.filter(transaction => transaction.type !== "transfer");
            const transactionsInDatabaseDates = transactionsNotTransfer.map(transaction => transaction.date);
            const lastDateInDatabase = transactionsInDatabaseDates.sort((a, b)=> new Date(a) - new Date(b))[transactionsInDatabaseDates.length - 1]; // Get the last date in the database
            const lastDateInDatabaseObj = new Date(lastDateInDatabase); // Convert string to Date object to be able to use the getFullYear, getMonth and getDate methods to calculate the previous month
            const previousMonthDateObj = new Date(lastDateInDatabaseObj.getFullYear(), lastDateInDatabaseObj.getMonth() - 1, lastDateInDatabaseObj.getDate()); // Get the date of the previous month
            const previousMonthDate = previousMonthDateObj.toISOString().split('T')[0]; // Convert Date object to string in the format YYYY-MM-DD

            // Get the balance for each category in the last date registered in the database, and compare it with the balance of the previous month
            const balanceByCategoryLastDateInDatabase = categoriesNotTransfer.map(category => {
                let lastMonthInDatabaseBalance = 0;
                let previousMonthBalance = 0;
                if (category.categoryType === "expense") {
                    lastMonthInDatabaseBalance = Math.round(transactionsInDatabase.filter(transaction => transaction.category_id === category.category_id && transaction.type === "expense" && transaction.date <= lastDateInDatabase).reduce((sum, transaction) => sum + transaction.amount, 0)*100)/100;
                    previousMonthBalance = Math.round(transactionsInDatabase.filter(transaction => transaction.category_id === category.category_id && transaction.type === "expense" && transaction.date <= previousMonthDate).reduce((sum, transaction) => sum + transaction.amount, 0)*100)/100;
                } else {
                    lastMonthInDatabaseBalance = Math.round(transactionsInDatabase.filter(transaction => transaction.category_id === category.category_id && transaction.type === "income" && transaction.date <= lastDateInDatabase).reduce((sum, transaction) => sum + transaction.amount, 0)*100)/100;
                    previousMonthBalance = Math.round(transactionsInDatabase.filter(transaction => transaction.category_id === category.category_id && transaction.type === "income" && transaction.date <= previousMonthDate).reduce((sum, transaction) => sum + transaction.amount, 0)*100)/100;
                }
                const difference = Math.round((lastMonthInDatabaseBalance - previousMonthBalance)*100)/100;
                return {
                    categoryId: category.category_id,
                    categoryName: category.category,
                    categoryType: category.categoryType,
                    lastMonthBalance: lastMonthInDatabaseBalance,
                    previousMonthBalance: previousMonthBalance,
                    difference: difference
                }  
            })
            
            setBalanceByCategoryLastDateInDatabase(balanceByCategoryLastDateInDatabase);
        }
    }, [transactionsInDatabase, categoriesInDatabase]);


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
                            <CategoryAndValue label={category.categoryName} value={category.lastMonthBalance} />
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
//Modify TrendArrow to show the trend of the category