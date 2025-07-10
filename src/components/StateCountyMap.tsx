import React from 'react';

interface CountyData {
  reps: number;
  active: boolean;
  requested?: boolean;
}

interface StateCountyMapProps {
  stateCode: string;
  counties: Record<string, CountyData>;
  onCountyClick?: (countyName: string) => void;
}

const StateCountyMap: React.FC<StateCountyMapProps> = ({ stateCode, counties, onCountyClick }) => {
  
  const getCountyFill = (countyName: string) => {
    const county = counties[countyName];
    if (!county) return '#e5e7eb'; // gray-200 - no data
    if (county.active) return '#10b981'; // green-500 - active coverage
    if (county.requested) return '#f59e0b'; // yellow-500 - requested
    return '#d1d5db'; // gray-300 - no coverage
  };

  const getCountyStroke = (countyName: string) => {
    return '#374151'; // gray-700 for borders
  };

  // California County Map SVG
  const CaliforniaMap = () => (
    <svg viewBox="0 0 400 500" className="w-full h-auto max-h-96">
      <title>California Counties</title>
      
      {/* Los Angeles County */}
      <path
        d="M 100 350 L 150 340 L 180 360 L 160 390 L 120 380 Z"
        fill={getCountyFill('Los Angeles')}
        stroke={getCountyStroke('Los Angeles')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Los Angeles')}
      >
        <title>Los Angeles County</title>
      </path>
      
      {/* Orange County */}
      <path
        d="M 150 340 L 180 360 L 170 380 L 150 370 Z"
        fill={getCountyFill('Orange')}
        stroke={getCountyStroke('Orange')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Orange')}
      >
        <title>Orange County</title>
      </path>
      
      {/* San Diego County */}
      <path
        d="M 120 380 L 170 380 L 160 420 L 110 420 Z"
        fill={getCountyFill('San Diego')}
        stroke={getCountyStroke('San Diego')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('San Diego')}
      >
        <title>San Diego County</title>
      </path>
      
      {/* Riverside County */}
      <path
        d="M 180 360 L 220 350 L 210 400 L 170 380 Z"
        fill={getCountyFill('Riverside')}
        stroke={getCountyStroke('Riverside')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Riverside')}
      >
        <title>Riverside County</title>
      </path>
      
      {/* Santa Clara County */}
      <path
        d="M 80 250 L 120 240 L 110 270 L 70 280 Z"
        fill={getCountyFill('Santa Clara')}
        stroke={getCountyStroke('Santa Clara')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Santa Clara')}
      >
        <title>Santa Clara County</title>
      </path>
      
      {/* San Francisco County */}
      <path
        d="M 60 220 L 80 210 L 80 240 L 60 250 Z"
        fill={getCountyFill('San Francisco')}
        stroke={getCountyStroke('San Francisco')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('San Francisco')}
      >
        <title>San Francisco County</title>
      </path>
      
      {/* Sacramento County */}
      <path
        d="M 120 180 L 160 170 L 150 200 L 110 210 Z"
        fill={getCountyFill('Sacramento')}
        stroke={getCountyStroke('Sacramento')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Sacramento')}
      >
        <title>Sacramento County</title>
      </path>
      
      {/* Fresno County */}
      <path
        d="M 140 280 L 180 270 L 170 310 L 130 320 Z"
        fill={getCountyFill('Fresno')}
        stroke={getCountyStroke('Fresno')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Fresno')}
      >
        <title>Fresno County</title>
      </path>
      
      {/* County Labels */}
      <text x="125" y="365" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">LA</text>
      <text x="165" y="360" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">OC</text>
      <text x="135" y="400" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">SD</text>
      <text x="200" y="375" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">RIV</text>
      <text x="95" y="260" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">SC</text>
      <text x="70" y="235" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">SF</text>
      <text x="135" y="195" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">SAC</text>
      <text x="155" y="295" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">FR</text>
    </svg>
  );

  // Texas County Map SVG
  const TexasMap = () => (
    <svg viewBox="0 0 400 300" className="w-full h-auto max-h-96">
      <title>Texas Counties</title>
      
      {/* Harris County (Houston area) */}
      <path
        d="M 200 200 L 250 190 L 260 220 L 210 230 Z"
        fill={getCountyFill('Harris')}
        stroke={getCountyStroke('Harris')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Harris')}
      >
        <title>Harris County</title>
      </path>
      
      {/* Dallas County */}
      <path
        d="M 150 120 L 200 110 L 190 140 L 140 150 Z"
        fill={getCountyFill('Dallas')}
        stroke={getCountyStroke('Dallas')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Dallas')}
      >
        <title>Dallas County</title>
      </path>
      
      {/* Travis County (Austin) */}
      <path
        d="M 120 180 L 170 170 L 160 200 L 110 210 Z"
        fill={getCountyFill('Travis')}
        stroke={getCountyStroke('Travis')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Travis')}
      >
        <title>Travis County</title>
      </path>
      
      {/* Bexar County (San Antonio) */}
      <path
        d="M 80 220 L 130 210 L 120 250 L 70 260 Z"
        fill={getCountyFill('Bexar')}
        stroke={getCountyStroke('Bexar')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Bexar')}
      >
        <title>Bexar County</title>
      </path>
      
      {/* Tarrant County (Fort Worth) */}
      <path
        d="M 120 100 L 170 90 L 160 120 L 110 130 Z"
        fill={getCountyFill('Tarrant')}
        stroke={getCountyStroke('Tarrant')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Tarrant')}
      >
        <title>Tarrant County</title>
      </path>
      
      {/* Collin County */}
      <path
        d="M 170 90 L 220 80 L 210 110 L 160 120 Z"
        fill={getCountyFill('Collin')}
        stroke={getCountyStroke('Collin')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Collin')}
      >
        <title>Collin County</title>
      </path>
      
      {/* County Labels */}
      <text x="225" y="210" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">HARRIS</text>
      <text x="170" y="130" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">DALLAS</text>
      <text x="140" y="190" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">TRAVIS</text>
      <text x="100" y="240" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">BEXAR</text>
      <text x="140" y="110" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">TARRANT</text>
      <text x="190" y="100" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">COLLIN</text>
    </svg>
  );

  // Florida County Map SVG
  const FloridaMap = () => (
    <svg viewBox="0 0 400 200" className="w-full h-auto max-h-96">
      <title>Florida Counties</title>
      
      {/* Miami-Dade County */}
      <path
        d="M 320 150 L 360 140 L 370 170 L 330 180 Z"
        fill={getCountyFill('Miami-Dade')}
        stroke={getCountyStroke('Miami-Dade')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Miami-Dade')}
      >
        <title>Miami-Dade County</title>
      </path>
      
      {/* Orange County (Orlando) */}
      <path
        d="M 200 120 L 250 110 L 240 140 L 190 150 Z"
        fill={getCountyFill('Orange')}
        stroke={getCountyStroke('Orange')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Orange')}
      >
        <title>Orange County</title>
      </path>
      
      {/* Broward County */}
      <path
        d="M 280 140 L 320 130 L 310 160 L 270 170 Z"
        fill={getCountyFill('Broward')}
        stroke={getCountyStroke('Broward')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Broward')}
      >
        <title>Broward County</title>
      </path>
      
      {/* Hillsborough County (Tampa) */}
      <path
        d="M 120 100 L 170 90 L 160 120 L 110 130 Z"
        fill={getCountyFill('Hillsborough')}
        stroke={getCountyStroke('Hillsborough')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Hillsborough')}
      >
        <title>Hillsborough County</title>
      </path>
      
      {/* Palm Beach County */}
      <path
        d="M 240 120 L 280 110 L 270 140 L 230 150 Z"
        fill={getCountyFill('Palm Beach')}
        stroke={getCountyStroke('Palm Beach')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Palm Beach')}
      >
        <title>Palm Beach County</title>
      </path>
      
      {/* Duval County (Jacksonville) */}
      <path
        d="M 220 60 L 270 50 L 260 80 L 210 90 Z"
        fill={getCountyFill('Duval')}
        stroke={getCountyStroke('Duval')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Duval')}
      >
        <title>Duval County</title>
      </path>
      
      {/* County Labels */}
      <text x="340" y="165" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">MIAMI</text>
      <text x="220" y="130" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">ORANGE</text>
      <text x="295" y="150" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">BROWARD</text>
      <text x="140" y="110" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">HILLS</text>
      <text x="255" y="135" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">PALM</text>
      <text x="240" y="75" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">DUVAL</text>
    </svg>
  );

  // New York County Map SVG
  const NewYorkMap = () => (
    <svg viewBox="0 0 300 300" className="w-full h-auto max-h-96">
      <title>New York Counties</title>
      
      {/* New York County (Manhattan) */}
      <path
        d="M 150 180 L 170 175 L 165 195 L 145 200 Z"
        fill={getCountyFill('New York')}
        stroke={getCountyStroke('New York')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('New York')}
      >
        <title>New York County (Manhattan)</title>
      </path>
      
      {/* Kings County (Brooklyn) */}
      <path
        d="M 165 195 L 185 190 L 180 210 L 160 215 Z"
        fill={getCountyFill('Kings')}
        stroke={getCountyStroke('Kings')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Kings')}
      >
        <title>Kings County (Brooklyn)</title>
      </path>
      
      {/* Queens County */}
      <path
        d="M 180 175 L 210 170 L 205 195 L 175 200 Z"
        fill={getCountyFill('Queens')}
        stroke={getCountyStroke('Queens')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Queens')}
      >
        <title>Queens County</title>
      </path>
      
      {/* Bronx County */}
      <path
        d="M 140 160 L 170 155 L 165 175 L 135 180 Z"
        fill={getCountyFill('Bronx')}
        stroke={getCountyStroke('Bronx')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Bronx')}
      >
        <title>Bronx County</title>
      </path>
      
      {/* Richmond County (Staten Island) */}
      <path
        d="M 120 200 L 150 195 L 145 220 L 115 225 Z"
        fill={getCountyFill('Richmond')}
        stroke={getCountyStroke('Richmond')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Richmond')}
      >
        <title>Richmond County (Staten Island)</title>
      </path>
      
      {/* Nassau County */}
      <path
        d="M 210 170 L 250 165 L 245 195 L 205 200 Z"
        fill={getCountyFill('Nassau')}
        stroke={getCountyStroke('Nassau')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Nassau')}
      >
        <title>Nassau County</title>
      </path>
      
      {/* County Labels */}
      <text x="155" y="190" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">NY</text>
      <text x="175" y="205" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">BK</text>
      <text x="190" y="185" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">QN</text>
      <text x="150" y="170" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">BX</text>
      <text x="130" y="212" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">SI</text>
      <text x="225" y="182" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">NS</text>
    </svg>
  );

  // Illinois County Map SVG
  const IllinoisMap = () => (
    <svg viewBox="0 0 200 400" className="w-full h-auto max-h-96">
      <title>Illinois Counties</title>
      
      {/* Cook County (Chicago) */}
      <path
        d="M 120 100 L 160 95 L 155 130 L 115 135 Z"
        fill={getCountyFill('Cook')}
        stroke={getCountyStroke('Cook')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Cook')}
      >
        <title>Cook County</title>
      </path>
      
      {/* DuPage County */}
      <path
        d="M 110 130 L 150 125 L 145 155 L 105 160 Z"
        fill={getCountyFill('DuPage')}
        stroke={getCountyStroke('DuPage')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('DuPage')}
      >
        <title>DuPage County</title>
      </path>
      
      {/* Lake County */}
      <path
        d="M 130 80 L 170 75 L 165 105 L 125 110 Z"
        fill={getCountyFill('Lake')}
        stroke={getCountyStroke('Lake')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Lake')}
      >
        <title>Lake County</title>
      </path>
      
      {/* Will County */}
      <path
        d="M 100 155 L 140 150 L 135 180 L 95 185 Z"
        fill={getCountyFill('Will')}
        stroke={getCountyStroke('Will')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Will')}
      >
        <title>Will County</title>
      </path>
      
      {/* Kane County */}
      <path
        d="M 80 120 L 120 115 L 115 145 L 75 150 Z"
        fill={getCountyFill('Kane')}
        stroke={getCountyStroke('Kane')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('Kane')}
      >
        <title>Kane County</title>
      </path>
      
      {/* McHenry County */}
      <path
        d="M 90 90 L 130 85 L 125 115 L 85 120 Z"
        fill={getCountyFill('McHenry')}
        stroke={getCountyStroke('McHenry')}
        strokeWidth="1"
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => onCountyClick?.('McHenry')}
      >
        <title>McHenry County</title>
      </path>
      
      {/* County Labels */}
      <text x="140" y="118" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">COOK</text>
      <text x="125" y="145" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">DuPAGE</text>
      <text x="145" y="95" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">LAKE</text>
      <text x="115" y="170" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">WILL</text>
      <text x="95" y="135" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">KANE</text>
      <text x="110" y="105" textAnchor="middle" className="text-xs fill-white font-semibold pointer-events-none">McHENRY</text>
    </svg>
  );

  // Generic placeholder for other states
  const GenericStateMap = () => (
    <svg viewBox="0 0 400 300" className="w-full h-auto max-h-96">
      <rect 
        width="400" 
        height="300" 
        fill="#f3f4f6" 
        stroke="#d1d5db" 
        strokeWidth="2"
        rx="8"
      />
      <text 
        x="200" 
        y="150" 
        textAnchor="middle" 
        className="text-lg fill-gray-500 font-semibold"
      >
        County Map Coming Soon
      </text>
      <text 
        x="200" 
        y="180" 
        textAnchor="middle" 
        className="text-sm fill-gray-400"
      >
        Visual county map for {stateCode}
      </text>
    </svg>
  );

  const renderStateMap = () => {
    switch (stateCode) {
      case 'CA':
        return <CaliforniaMap />;
      case 'TX':
        return <TexasMap />;
      case 'FL':
        return <FloridaMap />;
      case 'NY':
        return <NewYorkMap />;
      case 'IL':
        return <IllinoisMap />;
      default:
        return <GenericStateMap />;
    }
  };

  return (
    <div className="bg-muted/10 border border-muted rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-4 text-center">County Coverage Map</h4>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Active Coverage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Coverage Requested</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span className="text-sm">No Coverage</span>
        </div>
      </div>

      {/* State County Map */}
      <div className="flex justify-center">
        {renderStateMap()}
      </div>
      
      <p className="text-center text-sm text-muted-foreground mt-4">
        Click on counties for detailed information
      </p>
    </div>
  );
};

export default StateCountyMap;