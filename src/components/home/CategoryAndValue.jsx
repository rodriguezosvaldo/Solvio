import React from 'react'

const CategoryAndValue = ({label, value}) => (
    <div className='flex flex-col gap-2 justify-center items-center rounded-3xl p-4 border-2 border-gray-200'>
        <p className='text-white text-sm'>{label}</p>
        <span className='text-white text-sm'>$ {value}</span>
    </div>
);

export default CategoryAndValue

