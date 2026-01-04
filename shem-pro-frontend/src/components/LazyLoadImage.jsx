import React, { useState } from 'react';

const LazyLoadImage = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder / Blur Effect */}
      <div
        className={`absolute inset-0 bg-gray-200 dark:bg-gray-800 transition-opacity duration-700 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden="true"
      />

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...props}
      />
    </div>
  );
};

export default LazyLoadImage;