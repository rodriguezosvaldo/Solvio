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
    <div className="bg-black flex flex-col w-[768px] h-screen overflow-hidden">
      <div className="flex-1 w-full p-4 overflow-y-auto">
        <div className="transition-all duration-300 ease-in-out">
          {renderComponent()}
        </div>
      </div>
      {renderNavbar()}
    </div>
  );
}

export default App;
