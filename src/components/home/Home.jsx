import React from 'react'
import GeneralBudget from './GeneralBudget'
import ExpenseCategoryPieChart from './ExpenseCategoryPieChart'
import MainCategories from './MainCategories'
import IncomeExpenseCharts from './IncomeExpenseCharts'


const Home = () => {
    return (
        <div className='grid grid-cols-3 grid-rows-3 gap-4 w-full h-full'>
            <div className='col-span-1 row-span-1'>
                <GeneralBudget />
            </div>
            <div className='col-span-1 row-span-1'>
                <ExpenseCategoryPieChart />
            </div>
            <div className='col-span-1 row-span-3'>
                <MainCategories />
            </div>
            <div className='col-span-2 row-span-2'>
                <IncomeExpenseCharts />
            </div>
        </div>
    )
};

export default Home


