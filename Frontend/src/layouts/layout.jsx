import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FloatingActions from '../components/common/FloatingActions'
import { Outlet } from 'react-router-dom'


function Layout() {
  return (
    <>
    <Navbar/>
    <Outlet/>
    <Footer/>
    <FloatingActions/>
    </>
  )
}

export default Layout
