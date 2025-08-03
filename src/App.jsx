import { useState, useContext } from "react";
import Navbar from "./components/navbar/Navbar";
import Home from "./components/home/Home";
import Accounts from "./components/accounts/Accounts";
import Login from "./components/Login";
import { SolvioContext } from "./context/SolvioContext";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const { userId } = useContext(SolvioContext);

  const Components = {
    home: Home,
    accounts: Accounts,
    login: Login,
  };

  const renderComponent = () => {
    if (!userId) {
      return <Login />;
    }
    const Component = Components[activeTab];
    return Component ? <Component /> : <Home />;
  };

  const renderNavbar = () => {
    if (!userId) {
      return "";
    } else {
      return <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="bg-black sm:p-4 flex flex-col w-full h-screen justify-center items-center p-2 overflow-hidden rounded-2xl border border-white/60">
      <div className="flex w-full h-full justify-center items-center p-4 overflow-y-auto">
        {renderComponent()}
      </div>

      <div className="flex w-full justify-center items-center p-4">
        {renderNavbar()}
      </div>

      <div className="flex flex-col w-full h-5 justify-center items-center">
        <p className="text-white font-semibold text-xs">Developed with ❤️ by <a href="https://github.com/rodriguezosvaldo/" target="_blank" className="text-blue-500">Osvaldo Rodriguez</a></p>
        <p className="text-white font-semibold text-xs">Special thanks to <a href="https://code-you.org/" target="_blank" className="text-blue-500">Code:You</a></p>
      </div>
    </div>
  );
}

export default App;
