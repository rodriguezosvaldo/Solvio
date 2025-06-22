import React from 'react'

const CategoryAndValue = ({label, value}) => (
    <div className='bg-green-700 flex flex-col gap-2 justify-center items-center rounded-3xl p-4 w-full h-full'>
        <p className='text-white text-sm'>{label}</p>
        <span className='text-white text-sm'>$ {value}</span>
    </div>
);

export default CategoryAndValue

