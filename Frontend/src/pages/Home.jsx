import React from 'react'
import Header from '../components/Header.jsx'
import AdvocateProfile from '../components/AdvocateProfile.jsx'
import WaysICanHelp from '../components/WaysICanHelp.jsx'
import Features from '../components/Features.jsx'
import Faq from '../components/Faq.jsx'

const Home = () => {
  return (
    <div>
      <Header />
      <AdvocateProfile />
      <WaysICanHelp />
      <Features />
      <Faq />
    </div>
  )
}

export default Home