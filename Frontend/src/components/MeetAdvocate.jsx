import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Phone, BadgeCheck } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/919472761482?text=Hi%20Shivam%2C%20I'd%20like%20to%20ask%20about%20my%20legal%20situation.";

const MeetAdvocate = () => {
  return (
    <div className="bg-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Photo */}
        <div className="relative shrink-0">
          <div className="w-56 h-64 sm:w-64 sm:h-72 rounded-3xl overflow-hidden ring-4 ring-primary/30 shadow-xl shadow-primary/20 bg-gray-100">
            <img
              src="/shivam.jpg"
              alt="Adv. Shivam Parashar"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            <BadgeCheck className="w-3.5 h-3.5" />
            Adv. Shivam Parashar
          </span>
        </div>

        {/* Intro */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Meet Your Advocate
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mb-5 mx-auto md:mx-0"></div>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
            I'm Shivam Parashar, a Delhi-based advocate practising across
            criminal, civil, family, corporate, property, and tax matters.
            When you reach out, you talk to me directly — not an assistant,
            not a call centre. Every case gets my personal attention, in
            plain language you can actually act on.
          </p>
          <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 justify-center md:justify-start">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] px-6 py-3 rounded-full text-white font-medium hover:bg-[#20bd5a] hover:scale-105 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
            <a
              href="tel:+919472761482"
              className="flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-full font-medium hover:bg-primary/5 transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              +91 94727 61482
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Or{" "}
            <Link to="/lawyers" className="text-primary font-semibold hover:underline">
              book a consultation
            </Link>{" "}
            at a time that suits you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MeetAdvocate;
