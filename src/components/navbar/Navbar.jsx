import React from 'react';
import NavbarBtn from './NavbarBtn';
import WBtn from './WBtn';


//Add the breackpoints later md:flex-col md:gap-8 md:w-fit
const Navbar = ({ activeTab, setActiveTab }) => (
  <nav className="inline-flex justify-around w-full items-center px-4 py-2 md:py-4 rounded-3xl bg-transparent backdrop-blur-2xl border border-white/60">
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
    <NavbarBtn
      label="Stats"
      onClick={() => setActiveTab('stats')}
      isActive={activeTab === 'stats'}
    />
    <WBtn
      onClick={() => setActiveTab('w-btn')}
    />
  </nav>
);

export default Navbar;