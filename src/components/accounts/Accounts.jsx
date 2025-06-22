import React from 'react'
import Add from './Add';
import CategoryAndValue from '../home/CategoryAndValue';
import AccountsByCategory from './AccountsByCategory';


const Accounts = () => {


    return (
        <div className='flex flex-col gap-8 text-white p-6 w-full overflow-y-auto border-2 border-yellow-500 rounded-3xl'>
            <Add onClick={() => {}} />
            <div className='flex gap-2 w-full justify-around items-center'>
                <CategoryAndValue label='Assets' value={100} />
                <CategoryAndValue label='Liabilities' value={200} />
                <CategoryAndValue label='Total' value={300} />
            </div>
            <AccountsByCategory category='Cash' amount={100} />
            <AccountsByCategory category='Debit' amount={200} />
            <AccountsByCategory category='Credit' amount={300} />
            <AccountsByCategory category='Savings' amount={400} />
        </div>
    )
}

export default Accounts 