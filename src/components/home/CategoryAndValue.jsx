import React from 'react'

const CategoryAndValue = ({label, value, color}) => (
    <div className='flex flex-col w-full h-12 justify-center items-center rounded-2xl p-2 border-2 border-white/60' style={{borderColor: color}}>
        <p className='flex text-white'>{label}</p>
        <p className='flex text-white text-xs'>$ {value}</p>
    </div>
);

export default CategoryAndValue

