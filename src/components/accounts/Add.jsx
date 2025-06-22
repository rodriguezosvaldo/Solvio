import React from 'react';

const Add = ({onClick}) => {
    return (
        <button className='bg-green-700 flex w-10 h-10 self-end justify-center items-center rounded-2xl'
        onClick={onClick}
        >+</button>
    )
};

export default Add;