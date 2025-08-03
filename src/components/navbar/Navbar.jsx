import React from 'react';
import NavbarBtn from './NavbarBtn';

const Navbar = ({ activeTab='home', setActiveTab }) => {
  
  const logout = async () => {

    console.log("Need to implement logout function later");
  //   try {
  //     const { error } = await supabase_client.auth.signOut();
  //     if (error) {
  //       console.error("Error trying to logout+++", error);
  //     } else {
  //       console.log("Logout successful");
  //     }
  //   } catch (error) {
  //     console.error("Error trying to logout+++", error);
  //   }
  }
  
  return (
    <nav className="bg-black flex min-[375px]:w-auto min-[375px]:h-auto sm:w-full sm:h-16 justify-around items-center gap-2 px-4 py-2 rounded-3xl border border-white/60">
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
        label="Logout"
        onClick={logout}
      />
    </nav>
    )

}

export default Navbar;