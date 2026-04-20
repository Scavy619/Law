import React from 'react'
import { 
  Scale, 
  Video, 
  FileText, 
  Calendar,
  Bot
} from 'lucide-react'

const About = () => {
  const services = [
    {
      title: "Legal Consultation",
      description: "Connect with experienced lawyers across various specializations including family law, criminal law, corporate law, and more.",
      icon: <Scale className="w-8 h-8 text-primary" />
    },
    {
      title: "Document Management",
      description: "Upload, store, and analyze your legal documents securely. Our AI helps you understand complex legal language.",
      icon: <FileText className="w-8 h-8 text-primary" />
    },
    {
      title: "AI-Powered Guidance",
      description: "Get instant answers to legal questions using our RAG chatbot trained on extensive legal databases and your uploaded documents.",
      icon: <Bot className="w-8 h-8 text-primary" />
    },
    {
      title: "Video Call Sessions",
      description: "Face-to-face consultations with lawyers through secure, high-quality video calls with session recording options.",
      icon: <Video className="w-8 h-8 text-primary" />
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">About LawBridge</h1>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-4 md:mb-6"></div>
        <p className="text-gray-600 text-sm md:text-lg max-w-3xl mx-auto px-2">
          Bridging the gap between legal expertise and accessibility through cutting-edge AI technology and verified legal professionals.
        </p>
      </div>

      {/* Main About Section */}
      <div className="max-w-4xl mx-auto mb-16 md:mb-24">
        <div className="space-y-4 md:space-y-6 leading-relaxed">
          <p className="text-sm md:text-lg text-gray-600 text-justify">
            Welcome to <span className="font-semibold text-gray-800">LawBridge</span>, your intelligent partner for seamless legal assistance. 
            We understand the challenges individuals face when navigating legal processes, managing documents, or seeking the right legal guidance. 
            LawBridge combines the power of artificial intelligence with human expertise to make legal services accessible, affordable, and efficient.
          </p>
          <p className="text-sm md:text-lg text-gray-600 text-justify">
            We noticed a significant gap in legal accessibility, especially among young adults and teenagers who often hesitate to visit lawyers in person 
            due to social stigma, privacy concerns, or simply finding the process intimidating and time-consuming. Many feel uncomfortable discussing 
            personal legal matters face-to-face or struggle with the formality of traditional legal consultations. LawBridge eliminates these barriers 
            by providing a comfortable, private, and convenient platform where you can connect with verified lawyers from the comfort of your home.
          </p>
          <p className="text-sm md:text-lg text-gray-600 text-justify">
            Start with our AI assistant for instant guidance, book a video consultation to discuss your concerns privately, and if you feel comfortable 
            and need more in-depth support, you can always arrange to meet your lawyer in person. We believe legal help should be accessible to everyone, 
            without judgment, without hassle, and on your own terms.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl border-2 border-blue-200 mt-4 md:mt-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">
            Our Mission
          </h3>
          <p className="text-sm md:text-lg text-gray-700 text-justify">
            To democratize legal services by making expert legal guidance accessible to everyone, regardless of their location or budget. 
            We believe that everyone deserves quality legal support when they need it most, without barriers or stigma.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="mb-16 md:mb-24">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Our Services</h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-3 md:mb-4"></div>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-2">
            Comprehensive legal solutions tailored to your needs
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
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto px-2">
          Join thousands of users who trust LawBridge for their legal needs. Get instant AI assistance or book a consultation with a verified lawyer today.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
          <a 
            href="/chatbot" 
            className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-primary text-white rounded-lg text-sm md:text-base font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
          >
            Try AI Assistant
          </a>
          <a 
            href="/lawyers" 
            className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-white text-primary border-2 border-primary rounded-lg text-sm md:text-base font-medium hover:bg-primary/5 transition-colors"
          >
            Find a Lawyer
          </a>
        </div>
      </div>
    </div>
  )
}

export default About