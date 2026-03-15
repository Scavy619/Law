import React from 'react';

const Loader = ({ 
  className = '', 
  minHeight = 'min-h-[400px]', 
  text = 'Loading...',
  showText = true 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center w-full ${minHeight} ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer Ring track */}
        <div className="w-12 h-12 border-4 border-gray-100 rounded-full"></div>
        
        {/* Main Spinner Ring */}
        <div className="absolute w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        
        {/* Small Inner Ring */}
        <div className="absolute w-6 h-6 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-[spin_2s_linear_infinite_reverse] opacity-40"></div>
      </div>
      
      {showText && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="text-gray-500 font-medium tracking-wide text-sm animate-pulse">
            {text}
          </p>
        </div>
      )}
    </div>
  );
};

export default Loader;
