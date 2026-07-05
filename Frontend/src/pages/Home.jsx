import React from 'react'
import Header from '../components/Header.jsx'
import AdvocateProfile from '../components/AdvocateProfile.jsx'
import WaysICanHelp from '../components/WaysICanHelp.jsx'
import Features from '../components/Features.jsx'
import Faq from '../components/Faq.jsx'
import Reveal from '../components/common/Reveal.jsx'

const Home = () => {
  return (
    <div>
      <Header />
      <Reveal>
        <AdvocateProfile />
      </Reveal>
      <Reveal>
        <WaysICanHelp />
      </Reveal>
      <Reveal>
        <Features />
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
    </div>
  )
}

export default Home
