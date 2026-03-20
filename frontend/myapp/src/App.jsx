import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter,Route, Routes } from 'react-router-dom'
import SienUp from './SienUp'
import Login from './Login'
import Link from './Link'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/sign' element={<SienUp/>}/>
           <Route path="/" element={<Login />} />
           <Route path="/link" element={<Link />} />
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
