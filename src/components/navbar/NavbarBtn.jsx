import React from 'react';



const NavbarBtn = ({label, onClick, isActive}) => (
    <button
      className={`
        ${isActive 
          ? 'bg-green-600 text-white hover:shadow-gray-200 hover:shadow-lg' 
          : 'bg-gray-200 text-black hover:shadow-green-300 hover:shadow-lg'}
        rounded-md px-6 py-2 font-semibold hover:scale-105 transition duration-150
      `}
      onClick={onClick}
    >
      <span>{label}</span>
    </button>
  );
  
  export default NavbarBtn;