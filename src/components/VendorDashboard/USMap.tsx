import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface StateData {
  name: string;
  repCount: number;
  counties: string[];
}

interface USMapProps {
  statesWithCoverage: Record<string, StateData>;
  onStateClick: (stateCode: string) => void;
  selectedState: string;
}

// Simplified US states SVG paths - just a few key states for demonstration
const US_STATES = {
  'CA': {
    path: 'M158,206L158,206L158,210L158,214L155,217L152,220L149,222L146,225L143,228L140,230L137,233L134,235L131,238L128,240L125,243L122,245L119,248L116,250L113,253L110,255L107,258L104,260L101,263L98,265L95,268L92,270L89,273L86,275L83,278L80,280L77,283L74,285L71,288L68,290L65,293L62,295L59,298L56,300L53,303L50,305L47,308L44,310L41,313L38,315L35,318L32,320L29,323L26,325L23,328L20,330L17,333L14,335L11,338L8,340L5,343L2,345L2,345L5,348L8,350L11,353L14,355L17,358L20,360L23,363L26,365L29,368L32,370L35,373L38,375L41,378L44,380L47,383L50,385L53,388L56,390L59,393L62,395L65,398L68,400L71,403L74,405L77,408L80,410L83,413L86,415L89,418L92,420L95,423L98,425L101,428L104,430L107,433L110,435L113,438L116,440L119,443L122,445L125,448L128,450L131,453L134,455L137,458L140,460L143,463L146,465L149,468L152,470L155,473L158,475',
    name: 'California'
  },
  'TX': {
    path: 'M320,290L375,290L375,340L375,390L375,440L375,465L350,465L325,465L300,465L275,465L250,465L225,465L200,465L200,440L200,415L200,390L200,365L200,340L200,315L225,315L250,315L275,315L300,315L320,290',
    name: 'Texas'
  },
  'FL': {
    path: 'M500,400L550,400L580,420L590,440L585,460L575,475L560,485L545,490L530,485L515,480L500,475L490,460L485,445L490,430L500,415L500,400',
    name: 'Florida'
  },
  'NY': {
    path: 'M600,150L650,150L665,165L670,180L665,195L650,210L635,215L620,210L605,195L600,180L605,165L600,150',
    name: 'New York'
  },
  'IL': {
    path: 'M400,200L430,200L430,250L430,300L400,300L370,300L370,250L370,200L400,200',
    name: 'Illinois'
  },
  // Add a few more states for visual completeness
  'WA': {
    path: 'M50,50L150,50L150,100L50,100L50,50',
    name: 'Washington'
  },
  'OR': {
    path: 'M50,100L150,100L150,150L50,150L50,100',
    name: 'Oregon'
  },
  'NV': {
    path: 'M150,100L200,100L200,200L150,200L150,100',
    name: 'Nevada'
  },
  'AZ': {
    path: 'M150,200L250,200L250,280L150,280L150,200',
    name: 'Arizona'
  },
  'UT': {
    path: 'M200,100L250,100L250,200L200,200L200,100',
    name: 'Utah'
  },
  'CO': {
    path: 'M250,150L350,150L350,250L250,250L250,150',
    name: 'Colorado'
  },
  'NM': {
    path: 'M250,250L350,250L350,350L250,350L250,250',
    name: 'New Mexico'
  },
  'OK': {
    path: 'M320,250L420,250L420,290L320,290L320,250',
    name: 'Oklahoma'
  },
  'KS': {
    path: 'M320,200L420,200L420,250L320,250L320,200',
    name: 'Kansas'
  },
  'NE': {
    path: 'M320,150L450,150L450,200L320,200L320,150',
    name: 'Nebraska'
  },
  'ND': {
    path: 'M350,50L450,50L450,100L350,100L350,50',
    name: 'North Dakota'
  },
  'SD': {
    path: 'M350,100L450,100L450,150L350,150L350,100',
    name: 'South Dakota'
  },
  'WY': {
    path: 'M250,100L350,100L350,150L250,150L250,100',
    name: 'Wyoming'
  },
  'MT': {
    path: 'M200,50L350,50L350,100L200,100L200,50',
    name: 'Montana'
  },
  'ID': {
    path: 'M150,50L200,50L200,150L150,150L150,50',
    name: 'Idaho'
  }
};

const USMap: React.FC<USMapProps> = ({ statesWithCoverage, onStateClick, selectedState }) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const getStateColor = (stateCode: string) => {
    if (statesWithCoverage[stateCode]) {
      return 'hsl(var(--primary))'; // Blue for states with coverage
    }
    return 'hsl(var(--muted))'; // Grey for states without coverage
  };

  const getStateOpacity = (stateCode: string) => {
    if (selectedState === stateCode) return '0.9';
    if (hoveredState === stateCode) return '0.8';
    return statesWithCoverage[stateCode] ? '0.7' : '0.3';
  };

  const handleStateHover = (stateCode: string, event: React.MouseEvent) => {
    setHoveredState(stateCode);
    const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
    const stateData = statesWithCoverage[stateCode];
    const content = stateData 
      ? `${US_STATES[stateCode as keyof typeof US_STATES]?.name} - ${stateData.repCount} Reps Connected`
      : `${US_STATES[stateCode as keyof typeof US_STATES]?.name} - No Connected Reps`;
    
    setTooltip({
      x: event.clientX,
      y: event.clientY - 10,
      content
    });
  };

  const handleStateLeave = () => {
    setHoveredState(null);
    setTooltip(null);
  };

  const handleStateClick = (stateCode: string) => {
    onStateClick(stateCode);
  };

  return (
    <div className="relative">
      <svg
        viewBox="0 0 700 500"
        className="w-full max-w-4xl h-auto"
        style={{ maxHeight: '400px' }}
      >
        {Object.entries(US_STATES).map(([stateCode, stateInfo]) => (
          <path
            key={stateCode}
            d={stateInfo.path}
            fill={getStateColor(stateCode)}
            fillOpacity={getStateOpacity(stateCode)}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            className={cn(
              "cursor-pointer transition-all duration-200",
              selectedState === stateCode && "stroke-2",
              hoveredState === stateCode && "brightness-110"
            )}
            onMouseEnter={(e) => handleStateHover(stateCode, e)}
            onMouseLeave={handleStateLeave}
            onClick={() => handleStateClick(stateCode)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 text-xs bg-popover text-popover-foreground border rounded shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default USMap;