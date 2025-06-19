import React from 'react'
import GeneralBudget from './GeneralBudget'
import ExpenseCategoryPieChart from './ExpenseCategoryPieChart'
import MainCategories from './MainCategories'
import IncomeExpenseCharts from './IncomeExpenseCharts'


const Home = () => {
    return (
        <div className='flex flex-col gap-4'>
            <GeneralBudget />
            <ExpenseCategoryPieChart />
            <MainCategories />
            <IncomeExpenseCharts />
        </div>
    )
};

export default Home