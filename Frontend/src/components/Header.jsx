import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Phone, Sparkles } from 'lucide-react'
import { assets } from '../assets/assets'
import useApp from '../context/useApp'
import { site, lawyerProfile, whatsappLink } from '../siteConfig'

const Header = () => {
    const { lawyers } = useApp();
    const bookingPath = lawyers?.[0]?._id ? `/appointment/${lawyers[0]._id}` : '/lawyers';

    return (
        <div className='relative flex flex-col md:flex-row flex-wrap rounded-lg px-4 md:px-10 lg:px-20 overflow-hidden'>

            {/* --------- Background Image --------- */}
            <div className='absolute inset-0 z-0'>
                <img
                    className='w-full h-full object-cover object-center'
                    src={assets.homepgpic}
                    alt=""
                />
                {/* Warm overlay for readability without feeling cold or intimidating */}
                <div className='absolute inset-0 bg-gradient-to-br from-purple-950/78 via-fuchsia-900/58 to-pink-800/42'></div>
            </div>

            {/* --------- Header Content --------- */}
            <div className='relative z-10 w-full flex flex-col items-center justify-center gap-6 py-16 md:py-[10vw] text-center'>
                <span className='inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white text-xs md:text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-sm'>
                    <Sparkles className='w-3.5 h-3.5' />
                    A real person on the other end — not a call centre
                </span>
                <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight max-w-4xl'>
                    Got a Legal Question? Let's Talk It Through.
                </p>
                <div className='flex flex-col items-center gap-3 text-white/90 font-light max-w-2xl'>
                    <p className="text-base md:text-lg">
                        No jargon, no judgment — just a clear, honest conversation with {lawyerProfile.name} about
                        whatever you're dealing with, at your own pace.
                    </p>
                </div>
                <div className='flex flex-wrap justify-center gap-2 max-w-2xl'>
                    {lawyerProfile.specialities.map((spec) => (
                        <span key={spec} className='text-xs md:text-sm text-white/90 border border-white/25 rounded-full px-3 py-1'>
                            {spec}
                        </span>
                    ))}
                </div>
                <div className='flex flex-col sm:flex-row items-center gap-3 mt-2'>
                    <a
                        href={whatsappLink()}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 bg-[#25D366] px-8 py-3.5 rounded-full text-white text-base md:text-lg font-medium hover:scale-105 hover:bg-[#20bd5a] transition-all duration-300 shadow-lg shadow-black/10'
                    >
                        <MessageCircle className='w-5 h-5' />
                        Chat on WhatsApp
                    </a>
                    <Link to={bookingPath} className='flex items-center gap-2 bg-white px-8 py-3.5 rounded-full text-[#595959] text-base md:text-lg font-medium hover:scale-105 transition-all duration-300'>
                        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/>
                        </svg>
                        Book a Consultation
                    </Link>
                </div>
                <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-5 mt-1 text-white/80 text-sm'>
                    <a href={`tel:${site.phone}`} className='flex items-center gap-1.5 hover:text-white transition-colors'>
                        <Phone className='w-4 h-4' />
                        Or call {site.phoneDisplay}
                    </a>
                    <span className='hidden sm:inline text-white/40'>&middot;</span>
                    <Link to='/chatbot' className='flex items-center gap-1.5 hover:text-white underline underline-offset-4 transition-colors'>
                        Prefer to type it out? Ask the free AI assistant
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Header
