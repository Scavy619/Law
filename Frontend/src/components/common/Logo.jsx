import React from "react";
import { Scale } from "lucide-react";
import { site } from "../../siteConfig";

const Logo = ({ className = "", iconClassName = "w-8 h-8", textClassName = "text-xl" }) => {
  return (
    <div className={`flex items-center gap-2 shrink-0 ${className}`}>
      <div className="bg-primary text-white rounded-lg p-1.5 shrink-0">
        <Scale className={iconClassName} />
      </div>
      <div className="leading-tight">
        <p className={`font-bold text-gray-900 ${textClassName}`}>
          {site.brandName}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-500 tracking-wide uppercase -mt-0.5">
          {site.tagline}
        </p>
      </div>
    </div>
  );
};

export default Logo;
