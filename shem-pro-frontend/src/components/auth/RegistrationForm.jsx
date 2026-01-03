import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import OptimizedImage from '../OptimizedImage';
import registerImage from '../../assets/login-slide-1.png';

import { ArrowRightIcon } from '@heroicons/react/24/outline';

const RegistrationForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white transition-colors duration-500 relative">
      <Link to="/" className="fixed top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:shadow-md group">
        <ArrowRightIcon className="h-4 w-4 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Home</span>
      </Link>
      <div className="flex w-full max-w-6xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mx-4 min-h-[800px]">

        {/* Left Side - Visuals (hidden on mobile) */}
        <div className="hidden md:block w-1/2 relative overflow-hidden bg-gray-900">
          <div className="absolute inset-0">
            <OptimizedImage
              src={registerImage}
              alt="Smart Home"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-purple-900/80 mix-blend-multiply"></div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white z-10">
            <h2 className="text-4xl font-bold mb-6">Join SHEM Pro</h2>
            <p className="text-lg opacity-90 max-w-sm">
              Register now to start optimizing your home energy usage.
            </p>
          </div>
        </div>

        {/* Right Side - Google Form */}
        <div className="w-full md:w-1/2 flex flex-col bg-white dark:bg-gray-800 relative">

          <div className="flex-grow w-full h-full p-4">
            <iframe
              title="Registration Form"
              src="https://docs.google.com/forms/d/e/1FAIpQLSfAWpXccFwalKbcPh1H2ZL-SG2yt65q6BVDjE30D-kHzKLYuw/viewform?embedded=true"
              width="100%"
              height="100%"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              className="w-full h-full min-h-[700px] rounded-xl"
            >
              Loading form...
            </iframe>
          </div>

          <div className="p-4 text-center border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegistrationForm;