import React, { useState, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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

// US Topology URL - using a reliable CDN source
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// State code mapping for geography properties
const stateCodeMap: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

const USMap: React.FC<USMapProps> = ({ statesWithCoverage, onStateClick, selectedState }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ coordinates: [-96, 39], zoom: 1 });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const getStateColor = (stateCode: string) => {
    if (statesWithCoverage[stateCode]) {
      return 'hsl(var(--primary))'; // Blue for states with coverage
    }
    return 'hsl(var(--muted-foreground) / 0.3)'; // Light grey for states without coverage
  };

  const getStateOpacity = (stateCode: string) => {
    if (selectedState === stateCode) return 0.9;
    return statesWithCoverage[stateCode] ? 0.7 : 0.4;
  };

  const handleStateHover = useCallback((geo: any, event: React.MouseEvent) => {
    const stateName = geo.properties.NAME || geo.properties.name;
    const stateCode = stateCodeMap[stateName];
    
    if (stateCode) {
      const stateData = statesWithCoverage[stateCode];
      const content = stateData 
        ? `${stateName} - ${stateData.repCount} Reps Connected`
        : `${stateName} - No Connected Reps`;
      
      setTooltip({
        x: event.clientX,
        y: event.clientY - 10,
        content
      });
    }
  }, [statesWithCoverage]);

  const handleStateLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleStateClick = useCallback((geo: any) => {
    const stateName = geo.properties.NAME || geo.properties.name;
    const stateCode = stateCodeMap[stateName];
    if (stateCode) {
      onStateClick(stateCode);
    }
  }, [onStateClick]);

  const handleZoomIn = () => {
    if (zoom < 4) setZoom(zoom + 0.5);
  };

  const handleZoomOut = () => {
    if (zoom > 1) setZoom(zoom - 0.5);
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ coordinates: [-96, 39], zoom: 1 });
  };

  return (
    <div className="relative w-full">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          disabled={zoom >= 4}
          className="bg-background/80 backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          className="bg-background/80 backdrop-blur-sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="bg-background/80 backdrop-blur-sm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
        <h4 className="text-sm font-semibold mb-2">Coverage Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
            <span>States with Reps</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Coverage Requested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--muted-foreground) / 0.3)' }}></div>
            <span>No Coverage</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[500px] bg-muted/5 rounded-lg overflow-hidden border">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000,
          }}
          width={1000}
          height={500}
          className="w-full h-full"
        >
          <ZoomableGroup zoom={zoom}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.NAME || geo.properties.name;
                  const stateCode = stateCodeMap[stateName];
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getStateColor(stateCode)}
                      fillOpacity={getStateOpacity(stateCode)}
                      stroke="hsl(var(--border))"
                      strokeWidth={selectedState === stateCode ? 2 : 0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: {
                          outline: 'none',
                          filter: 'brightness(1.1)',
                          cursor: 'pointer',
                        },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={(event) => handleStateHover(geo, event)}
                      onMouseLeave={handleStateLeave}
                      onClick={() => handleStateClick(geo)}
                      className={cn(
                        "transition-all duration-200",
                        selectedState === stateCode && "drop-shadow-lg"
                      )}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Map Info */}
      <div className="mt-2 text-center text-xs text-muted-foreground">
        Click and drag to pan • Use zoom controls or scroll to zoom • Click states for details
      </div>

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