import React from 'react';
import AccNameAndAmount from './AccNameAndAmount';
import Delete from './Delete';


const AccountsByCategory = ({category, amount}) => {


    return (
        <div className='bg-green-200/20 flex flex-col gap-2 w-full justify-start items-start p-4 rounded-3xl'>
            <div className='flex w-full h-auto justify-between items-center border-2 border-gray-200 rounded-3xl p-2'>
                <span className='text-sm text-gray-200'>{category}</span>
                <span className='text-sm text-gray-200'>$total</span>
            </div>
            <div className='flex flex-col w-full gap-4 justify-start items-start border-2 border-gray-200 rounded-3xl p-2'>
                <div className='flex w-full justify-between items-center p-2'>
                    <AccNameAndAmount name='Discover' amount={amount} />
                    <Delete onClick={() => {}} />
                </div>

                <div className='flex w-full justify-between items-center p-2'>
                    <AccNameAndAmount name='AMEX' amount={amount} />
                    <Delete onClick={() => {}} />
                </div>

                <div className='flex w-full justify-between items-center p-2'>
                    <AccNameAndAmount name='Capital One' amount={amount} />
                    <Delete onClick={() => {}} />
                </div>
            </div>
        </div>
    )
};

export default AccountsByCategory;