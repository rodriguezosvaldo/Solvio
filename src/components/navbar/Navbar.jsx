import React from 'react';
import NavbarBtn from './NavbarBtn';

//Add the breackpoints later md:flex-col md:gap-8 md:w-fit
const Navbar = ({ activeTab='home', setActiveTab }) => (
  <nav className="bg-black flex justify-around w-full h-16 items-center px-4 py-2 rounded-3xl border border-white/60">
    <NavbarBtn
      label="Home"
      onClick={() => setActiveTab('home')}
      isActive={activeTab === 'home'}
    />
    <NavbarBtn
      label="Accounts"
      onClick={() => setActiveTab('accounts')}
      isActive={activeTab === 'accounts'}
    />
  </nav>
);

export default Navbar;