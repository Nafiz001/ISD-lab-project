import React from 'react';

const CashIcon = ({ className = "w-8 h-8", size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="45" fill="#10B981" stroke="#059669" strokeWidth="2"/>
      
      {/* Cash/money stack */}
      <g transform="translate(25, 30)">
        {/* Bottom bill */}
        <rect x="2" y="12" width="46" height="28" rx="4" fill="#16A34A" stroke="#15803D" strokeWidth="1"/>
        {/* Middle bill */}
        <rect x="1" y="8" width="46" height="28" rx="4" fill="#22C55E" stroke="#16A34A" strokeWidth="1"/>
        {/* Top bill */}
        <rect x="0" y="4" width="46" height="28" rx="4" fill="#4ADE80" stroke="#22C55E" strokeWidth="1"/>
        
        {/* Dollar symbol on top bill */}
        <text 
          x="23" 
          y="23" 
          textAnchor="middle" 
          fontSize="16" 
          fontWeight="bold" 
          fill="#15803D"
          fontFamily="Arial, sans-serif"
        >
          ৳
        </text>
      </g>
      
      {/* Delivery truck icon */}
      <g transform="translate(60, 65)">
        <rect x="0" y="0" width="18" height="10" rx="2" fill="white" stroke="#059669" strokeWidth="1"/>
        <rect x="15" y="2" width="6" height="6" rx="1" fill="white" stroke="#059669" strokeWidth="1"/>
        <circle cx="5" cy="12" r="3" fill="#059669"/>
        <circle cx="16" cy="12" r="3" fill="#059669"/>
      </g>
    </svg>
  );
};

export default CashIcon;
