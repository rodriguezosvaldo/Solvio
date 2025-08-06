import React from 'react'
import GeneralBudget from './GeneralBudget'
import MainCategories from './MainCategories'
import IncomeExpenseChart from './IncomeExpenseChart'
import CategoriesPieChart from './CategoriesPieChart'



const Home = () => {
    return (
        <div className='max-sm:flex-col-reverse flex gap-4 w-full h-full overflow-y-auto'>
            <div className='max-sm:h-3/4 max-sm:gap-1 max-sm:p-0 flex flex-col w-full h-full justify-center items-center gap-4 py-2 overflow-y-auto'>
                <div className='flex w-full h-1/2 justify-center items-center gap-4 p-2'>
                    <div className='flex w-full h-full justify-center items-center animate-blurred-fade-in duration-300'>
                        <GeneralBudget/>
                    </div>
                    <div className='flex w-full h-full justify-center items-center animate-flip-in-y duration-300 animate-delay-1000'>
                        <CategoriesPieChart />
                    </div>
                </div>

                <div className='flex w-full h-1/2 justify-center items-center p-2 animate-flip-in-y duration-300 animate-delay-1000'>
                    <IncomeExpenseChart />
                </div>
            </div>

            <div className='max-sm:w-full max-sm:h-1/4 max-sm:p-0 flex w-1/2 h-full justify-center items-center py-2 overflow-y-auto animate-blurred-fade-in duration-300'>
                <MainCategories />
            </div>
        </div>
    )
};

export default Home


