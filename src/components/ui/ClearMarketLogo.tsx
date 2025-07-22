import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ClearMarketLogoProps {
  size?: number;
  className?: string;
  enableAdminAccess?: boolean; // Optional prop to enable admin access
}

const ClearMarketLogo: React.FC<ClearMarketLogoProps> = ({ 
  size = 48, 
  className = "",
  enableAdminAccess = false // Default to false
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (enableAdminAccess) {
      navigate('/auth');
    }
  };

  return (
    <img
      src="/icon-192.png"
      alt="ClearMarket Logo"
      width={size}
      height={size}
      className={`${enableAdminAccess ? 'cursor-pointer' : ''} ${className}`}
      onClick={enableAdminAccess ? handleClick : undefined}
    />
  );
};

export default ClearMarketLogo;
