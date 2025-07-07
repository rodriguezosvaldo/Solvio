import { useState, useEffect } from "react";
import Navbar from "./components/navbar/Navbar";
import Home from "./components/home/Home";
import Accounts from "./components/accounts/Accounts";
import Stats from "./components/stats/Stats";
import supabase_client from "./supabase/client";
import Login from "./components/Login";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const Components = {
    home: Home,
    accounts: Accounts,
    stats: Stats,
    login: Login,
  };


  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase_client.auth.getUser();
        if (error) {
          console.log('No user ++++++++++++++');
          console.log(error);
          setUser(null);
          return;
        }
        setUser(data.user);
        console.log(data.user);
      } catch (error) {
        setUser(null);
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []); 

  const renderComponent = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return <Login />;
    }

    const Component = Components[activeTab];
    return Component ? <Component userId={user.id} /> : <Home />;
  };

  const renderNavbar = () => {
    if (loading || !user) {
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
