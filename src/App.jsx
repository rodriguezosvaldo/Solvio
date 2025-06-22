import { useState } from 'react'
import Navbar from './components/navbar/Navbar'
import Home from './components/home/Home'
import Accounts from './components/accounts/Accounts'
import Stats from './components/stats/Stats'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />
      case 'accounts':
        return <Accounts />
      case 'stats':
        return <Stats />
      default:
        return <Home />
    }
  }

  return (
    <div className='bg-black flex flex-col max-w-[768px] h-screen overflow-hidden'>
      <div className='flex-1 w-full p-4 overflow-y-auto'>
        {renderActiveComponent()}
      </div>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default App
