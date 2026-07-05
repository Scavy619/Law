import React from 'react'
import { useNavigate } from 'react-router-dom'
import useApp from '../context/useApp'
import {
  Scale,
  Video,
  FileText,
  Bot,
  GraduationCap
} from 'lucide-react'
import { lawyerProfile, site } from '../siteConfig'

const About = () => {
  const navigate = useNavigate();
  const { lawyers } = useApp();
  const bookingPath = lawyers?.[0]?._id ? `/appointment/${lawyers[0]._id}` : '/lawyers';

  const services = [
    {
      title: "One-on-One Consultation",
      description: "Direct access to Shivam himself for a clear, honest assessment of your case — no junior associates, no runaround.",
      icon: <Scale className="w-8 h-8 text-primary" />
    },
    {
      title: "Document Review & Analysis",
      description: "Upload your legal documents securely for review, with AI-assisted analysis to help you understand complex legal language.",
      icon: <FileText className="w-8 h-8 text-primary" />
    },
    {
      title: "AI-Powered Guidance",
      description: "Get instant answers to general legal questions any time of day using the built-in AI legal assistant.",
      icon: <Bot className="w-8 h-8 text-primary" />
    },
    {
      title: "Video Consultations",
      description: "Face-to-face consultations from wherever you are, through secure, high-quality video calls.",
      icon: <Video className="w-8 h-8 text-primary" />
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">About {lawyerProfile.name}</h1>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-4 md:mb-6"></div>
        <p className="text-gray-600 text-sm md:text-lg max-w-3xl mx-auto px-2">
          A Delhi-based advocate focused on clear advice, direct communication, and personal attention on every case.
        </p>
      </div>

      {/* Main About Section */}
      <div className="max-w-4xl mx-auto mb-16 md:mb-24">
        <div className="flex items-center gap-2 justify-center mb-6 text-gray-700">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="font-medium">{lawyerProfile.degree}</span>
        </div>
        <div className="space-y-4 md:space-y-6 leading-relaxed">
          {lawyerProfile.fullBio.map((paragraph, index) => (
            <p key={index} className="text-sm md:text-lg text-gray-600 text-justify">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 md:p-6 rounded-xl border-2 border-purple-200 mt-4 md:mt-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">
            Practice Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {lawyerProfile.specialities.map((spec) => (
              <span
                key={spec}
                className="text-sm bg-white text-primary border border-primary/30 rounded-full px-4 py-1.5"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="mb-16 md:mb-24">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">How I Can Help</h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-3 md:mb-4"></div>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-2">
            A few ways to get started, depending on what you need
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div key={index} className="flex flex-col">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                {service.icon}
                {service.title}
              </h3>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-6 border border-gray-200 flex-1">
                <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gray-50 rounded-2xl md:rounded-3xl p-6 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">
          Ready to Talk Through Your Situation?
        </h2>
        <p className="text-gray-600 text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto px-2">
          Book a consultation directly with {lawyerProfile.name}, or start with the free AI assistant if you just have a quick question.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
          <button
            onClick={() => navigate(bookingPath)}
            className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-primary text-white rounded-lg text-sm md:text-base font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
          >
            Book a Consultation
          </button>
          <button
            onClick={() => navigate('/chatbot')}
            className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-white text-primary border-2 border-primary rounded-lg text-sm md:text-base font-medium hover:bg-primary/5 transition-colors"
          >
            Try AI Assistant
          </button>
        </div>
      </div>
    </div>
  )
}

export default About
