import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock, AlertTriangle, MessageCircle } from 'lucide-react'
import useApp from '../context/useApp'
import { site, lawyerProfile, whatsappLink } from '../siteConfig'

const Contact = () => {
  const navigate = useNavigate()
  const { lawyers } = useApp()
  const bookingPath = lawyers?.[0]?._id ? `/appointment/${lawyers[0]._id}` : '/lawyers'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Let's Talk</h1>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-4"></div>
        <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
          Whatever it is, you don't have to figure it out alone. Send a message and I'll get back to you personally — no forms, no runaround.
        </p>
      </div>

      {/* WhatsApp — lead channel */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col sm:flex-row items-center gap-6 mb-8 bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 border-2 border-[#25D366]/30 rounded-2xl p-8 hover:border-[#25D366] transition-all duration-300"
      >
        <div className="w-16 h-16 shrink-0 bg-[#25D366] rounded-2xl flex items-center justify-center shadow-lg shadow-[#25D366]/20 group-hover:scale-105 transition-transform">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Chat on WhatsApp</h2>
          <p className="text-gray-600 text-sm">
            The easiest way to reach me — send a message whenever it's on your mind, I'll reply as soon as I can.
          </p>
        </div>
        <span className="px-6 py-3 bg-[#25D366] text-white rounded-full font-semibold text-sm whitespace-nowrap group-hover:bg-[#20bd5a] transition-colors">
          {site.phoneDisplay}
        </span>
      </a>

      {/* Contact Information Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:bg-primary">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white/20">
            <Phone className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-white transition-colors">Call</h3>
          <a href={`tel:${site.phone}`} className="text-primary group-hover:text-white font-semibold text-lg transition-colors block mb-2">
            {site.phoneDisplay}
          </a>
          <p className="text-gray-500 group-hover:text-white/80 transition-colors text-sm">Mon - Sat, 9:00 AM - 7:00 PM</p>
        </div>

        <div className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:bg-primary">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white/20">
            <Mail className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-white transition-colors">Email</h3>
          <a href={`mailto:${site.email}`} className="text-primary group-hover:text-white font-semibold text-sm break-all transition-colors block mb-2">
            {site.email}
          </a>
          <p className="text-gray-500 group-hover:text-white/80 transition-colors text-sm">Usually replies within 24 hours</p>
        </div>

        <div className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:bg-primary">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-white/20">
            <MapPin className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-white transition-colors">Location</h3>
          <p className="text-gray-600 group-hover:text-white/90 transition-colors text-sm leading-relaxed">
            {site.address}
          </p>
        </div>
      </div>

      {/* Book CTA */}
      <div className="mb-12 bg-gradient-to-br from-purple-50 to-fuchsia-50 border-2 border-purple-100 rounded-2xl p-8 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Prefer to talk it through?</h2>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          For anything specific to your case, a consultation is the fastest way to get a real answer — video or in person.
        </p>
        <button
          onClick={() => navigate(bookingPath)}
          className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Book a Consultation
        </button>
      </div>

      {/* Business Hours */}
      <div className="max-w-2xl mx-auto bg-gray-50 border border-gray-200 rounded-xl p-8 mb-12">
        <div className="flex items-center justify-center mb-6">
          <Clock className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-xl font-bold text-gray-800">Availability</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
            <span className="font-semibold text-gray-800 text-sm md:text-base">Monday - Saturday</span>
            <span className="font-bold text-primary text-sm md:text-base">9:00 AM - 7:00 PM</span>
          </div>
          <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
            <span className="font-semibold text-gray-800 text-sm md:text-base">Sunday</span>
            <span className="font-bold text-red-600 text-sm md:text-base">Closed</span>
          </div>
        </div>
      </div>

      {/* Emergency Notice */}
      <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-20">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-base font-semibold text-yellow-800 mb-1">Not for emergencies</h3>
            <p className="text-yellow-800 text-sm leading-relaxed">
              For urgent situations (e.g. FIR issues, active police matters), contact your nearest police station or a legal aid helpline directly — this page is not monitored for emergencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
