import React from 'react';

interface ClearMarketLogoProps {
  size?: number;
  className?: string;
}

const ClearMarketLogo: React.FC<ClearMarketLogoProps> = ({ 
  size = 48, 
  className = "" 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded square background */}
      <rect
        width="200"
        height="200"
        rx="40"
        fill="url(#gradient)"
      />
      
      {/* House outline */}
      <path
        d="M50 170V120L100 70L150 120V170H120V140H80V170H50Z"
        stroke="white"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Chimney */}
      <path
        d="M70 90V70H85V80"
        stroke="white"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Checkmark */}
      <path
        d="M90 125L105 140L130 115"
        stroke="white"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default ClearMarketLogo;
