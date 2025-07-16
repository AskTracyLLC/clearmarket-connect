import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, BookmarkPlus, MapPin, Trash2, Clock } from "lucide-react";
import { useStates, useCountiesByState, useLocationByZip } from "@/hooks/useLocationData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SavedSearch {
  id: string;
  name: string;
  search_type: 'county' | 'city' | 'zipcode';
  location_value: string;
  location_display: string;
  created_at: string;
  user_id: string;
}

const LocalNewsSearch = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { states } = useStates();
  
  // Search form state
  const [searchType, setSearchType] = useState<'county' | 'city' | 'zipcode'>('county');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [cityName, setCityName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [searchName, setSearchName] = useState('');
  
  // Saved searches state
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { counties } = useCountiesByState(selectedState);
  const { location: zipLocation } = useLocationByZip(zipCode);

  // Load saved searches
  useEffect(() => {
    if (user) {
      loadSavedSearches();
    }
  }, [user]);

  const loadSavedSearches = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_local_news_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const handleSaveSearch = async () => {
    if (!user || !searchName.trim()) {
      toast.error("Please enter a search name");
      return;
    }

    let locationValue = '';
    let locationDisplay = '';

    switch (searchType) {
      case 'county':
        if (!selectedState || !selectedCounty) {
          toast.error("Please select state and county");
          return;
        }
        locationValue = `${selectedState}:${selectedCounty}`;
        const stateName = states.find(s => s.code === selectedState)?.name || selectedState;
        locationDisplay = `${selectedCounty}, ${stateName}`;
        break;
      case 'city':
        if (!cityName.trim()) {
          toast.error("Please enter city name");
          return;
        }
        locationValue = cityName.trim();
        locationDisplay = cityName.trim();
        break;
      case 'zipcode':
        if (!zipCode.trim()) {
          toast.error("Please enter zip code");
          return;
        }
        locationValue = zipCode.trim();
        locationDisplay = zipLocation ? 
          `${zipCode} (${zipLocation.county?.name}, ${zipLocation.state?.name})` : 
          zipCode;
        break;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('saved_local_news_searches')
        .insert({
          user_id: user.id,
          name: searchName.trim(),
          search_type: searchType,
          location_value: locationValue,
          location_display: locationDisplay
        });

      if (error) throw error;

      toast.success("Search saved successfully");
      setSearchName('');
      await loadSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error("Failed to save search");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    try {
      const { error } = await supabase
        .from('saved_local_news_searches')
        .delete()
        .eq('id', searchId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success("Search deleted");
      await loadSavedSearches();
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error("Failed to delete search");
    }
  };

  const handleQuickSearch = (search: SavedSearch) => {
    // Set form values based on saved search
    setSearchType(search.search_type);
    
    switch (search.search_type) {
      case 'county':
        const [state, county] = search.location_value.split(':');
        setSelectedState(state);
        setSelectedCounty(county);
        break;
      case 'city':
        setCityName(search.location_value);
        break;
      case 'zipcode':
        setZipCode(search.location_value);
        break;
    }
    
    toast.success(`Loaded search: ${search.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <h3 className="font-semibold text-primary mb-3">Local News</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>User can setup areas of interest.</p>
            <p><strong>Example:</strong> Elgin, IL</p>
            <p>- Weather (High Priority)</p>
            <p>- Economic</p>
            <p>- Emergency Alerts</p>
            <p>- Road Closures</p>
            <p>- Disasters</p>
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
            <p className="text-amber-800">
              Local News will not be saved like our community posts unless users select them to be saved.
              By default - these will refresh every hour for most recent based.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Add Local News Area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Type</label>
            <Select value={searchType} onValueChange={(value: 'county' | 'city' | 'zipcode') => setSearchType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="county">County</SelectItem>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="zipcode">Zip Code</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Fields based on type */}
          {searchType === 'county' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">County</label>
                <Select value={selectedCounty} onValueChange={setSelectedCounty} disabled={!selectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((county) => (
                      <SelectItem key={county.id} value={county.name}>
                        {county.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {searchType === 'city' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">City Name</label>
              <Input
                placeholder="Enter city name (e.g., Elgin, IL)"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
              />
            </div>
          )}

          {searchType === 'zipcode' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Zip Code</label>
              <Input
                placeholder="Enter zip code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
              {zipLocation && (
                <p className="text-sm text-muted-foreground">
                  {zipLocation.county?.name}, {zipLocation.state?.name}
                </p>
              )}
            </div>
          )}

          {/* Save Search Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Name</label>
            <Input
              placeholder="Enter a name for this search"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <Button onClick={handleSaveSearch} disabled={loading} className="w-full">
            <BookmarkPlus className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Search"}
          </Button>
        </CardContent>
      </Card>

      {/* Saved Searches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5" />
            Saved Local News Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedSearches.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Saved Searches</h3>
              <p className="text-muted-foreground">
                Save your local news areas for quick access later.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{search.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {search.search_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {search.location_display}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(search.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSearch(search)}
                    >
                      <Search className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSearch(search.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalNewsSearch;