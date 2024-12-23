import React from 'react'
import Home from './pages/Home'
import Result from './pages/Result'
import BuyCredit from './pages/BuyCredit'
import Navbar from './components/Navbar'
import {Route,Routes} from 'react-router-dom'

const App = () => {
  return (
    <div className='px-4 sm:pz-10 md:px-14 lg:pz-28 min-h-screen bg-gradient-to-b frm-teal-50 to-orange-50'>
      <Navbar/>
      <Routes>
        <Route path ="/" element = {<Home/>}/>
        <Route path ="/result" element = {<Result/>}/>
        <Route path ="/buy" element = {<BuyCredit/>}/>
      </Routes>
    </div>
  )
}

export default App
