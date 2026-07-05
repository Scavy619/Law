import React from 'react'
import Header from '../components/Header.jsx'
import MeetAdvocate from '../components/MeetAdvocate.jsx'
import Situations from '../components/Situations.jsx'
import TopLawyers from '../components/TopLawyers.jsx'
import Features from '../components/Features.jsx'
import Faq from '../components/Faq.jsx'

const Home = () => {
  return (
    <div>
      <Header />
      <MeetAdvocate />
      <TopLawyers />
      <Situations />
      <Features />
      <Faq />
    </div>
  )
}

export default Home
