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
    <img
      src="/icon-192.png"
      alt="ClearMarket Logo"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default ClearMarketLogo;
