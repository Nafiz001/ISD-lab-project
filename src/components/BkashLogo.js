import React from 'react';

const BkashLogo = ({ className = "w-8 h-8", size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* bKash background */}
      <rect width="100" height="100" rx="12" fill="#E2136E" />
      
      {/* bKash text */}
      <text 
        x="50" 
        y="35" 
        textAnchor="middle" 
        fontSize="18" 
        fontWeight="bold" 
        fill="white"
        fontFamily="Arial, sans-serif"
      >
        bKash
      </text>
      
      {/* Mobile money icon */}
      <g transform="translate(30, 50)">
        {/* Phone outline */}
        <rect x="10" y="5" width="20" height="30" rx="3" fill="none" stroke="white" strokeWidth="2"/>
        {/* Screen */}
        <rect x="12" y="9" width="16" height="18" rx="1" fill="white"/>
        {/* Dollar sign */}
        <text x="20" y="21" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#E2136E">৳</text>
      </g>
    </svg>
  );
};

export default BkashLogo;
