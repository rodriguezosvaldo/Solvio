import React from 'react';

const AccNameAndAmount = ({name, amount}) => {
    return (
        <div className='flex justify-between items-center w-full border-b-2 border-gray-600/40 p-2'>
            <span className='text-sm text-gray-200'>{name}</span>
            <span className='text-sm text-gray-200'>{amount}</span>
        </div>
    )
}

export default AccNameAndAmount;