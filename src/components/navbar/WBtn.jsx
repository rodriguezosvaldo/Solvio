import React from 'react';


const WBtn = ({img, onClick}) => (
    <button 
    className="bg-white text-black border border-white rounded-full p-2 font-semibold hover:bg-gray-100 transition" 
    onClick={onClick}>
        <span>WB</span>
    </button>
);

export default WBtn;
