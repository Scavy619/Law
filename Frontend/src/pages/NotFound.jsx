import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="text-primary font-black text-9xl mb-4">404</div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Page Not Found
      </h1>
      <p className="text-gray-500 text-lg md:text-xl max-w-lg mb-8">
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 rounded-full border-2 border-primary text-primary font-medium hover:bg-primary/5 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
