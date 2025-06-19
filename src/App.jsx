import { useState } from 'react'
import Navbar from './components/navbar/Navbar'


function App() {
  const [activeTab, setActiveTab] = useState('home')
//modify w-[768px] to w-full
  return (
    <div className='bg-black flex flex-col h-screen w-[768px] justify-center items-center overflow-hidden'>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default App
