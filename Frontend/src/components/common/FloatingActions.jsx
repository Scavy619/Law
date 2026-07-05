import React, { useEffect, useState } from "react";
import { MessageCircle, ArrowUp } from "lucide-react";
import { whatsappLink } from "../../siteConfig";

// Floating WhatsApp button (always visible) + back-to-top button (after scrolling).
const FloatingActions = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary/40 transition-all duration-300 ${
          showTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center"
      >
        <span className="absolute right-full mr-3 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
          Chat with Shivam
        </span>
        <span className="relative w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/40 flex items-center justify-center hover:scale-110 transition-transform duration-300">
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
          <MessageCircle className="w-7 h-7 text-white relative" />
        </span>
      </a>
    </div>
  );
};

export default FloatingActions;
