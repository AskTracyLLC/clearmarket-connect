import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ClearMarketLogoProps {
  size?: number;
  className?: string;
}

const ClearMarketLogo: React.FC<ClearMarketLogoProps> = ({ 
  size = 48, 
  className = "" 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/admin-auth');
  };

  return (
    <img
      src="/icon-192.png"
      alt="ClearMarket Logo"
      width={size}
      height={size}
      className={`cursor-pointer ${className}`}
      onClick={handleClick}
    />
  );
};

export default ClearMarketLogo;
