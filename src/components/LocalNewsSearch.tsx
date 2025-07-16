import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookmarkPlus, MapPin, Trash2, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { useStates, useCountiesByState } from "@/hooks/useLocationData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SavedSearch {
  id: string;
  name: string;
  search_type: 'county' | 'search';
  location_value: string;
  location_display: string;
  created_at: string;
  user_id: string;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  priority: string;
  icon: string;
  category: string;
}

interface NewsData {
  location: string;
  totalArticles: number;
  categories: Record<string, NewsArticle[]>;
  timestamp: string;
}

const LocalNewsSearch = () => {
  const { user } = useAuth();
  const { states } = useStates();
  
  // Search form state
  const [selectedState, setSelectedState] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchName, setSearchName] = useState('');
  
  // Saved searches state
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  
  // News data state
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loadingNews, setLoadingNews] = useState(false);
  const [currentSearchLocation, setCurrentSearchLocation] = useState('');
  
  const { counties } = useCountiesByState(selectedState);

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
      setSavedSearches((data as SavedSearch[]) || []);
    } catch (error) {
      console.error('Error loading saved searches:', error);
      toast.error("Failed to load saved searches");
    }
  };

  const handleSaveSearch = async () => {
    if (!user || !searchName.trim()) {
      toast.error("Please enter a search name");
      return;
    }

    let locationValue = '';
    let locationDisplay = '';
    let searchType: 'county' | 'search' = 'county';

    // Check if user selected state and county
    if (selectedState && selectedCounty) {
      locationValue = `${selectedState}:${selectedCounty}`;
      const stateName = states.find(s => s.code === selectedState)?.name || selectedState;
      locationDisplay = `${selectedCounty}, ${stateName}`;
      searchType = 'county';
    } else if (searchInput.trim()) {
      // User entered something in search bar
      locationValue = searchInput.trim();
      locationDisplay = searchInput.trim();
      searchType = 'search';
    } else {
      toast.error("Please select state and county OR enter a city/zipcode");
      return;
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
      setSelectedState('');
      setSelectedCounty('');
      setSearchInput('');
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
    if (search.search_type === 'county') {
      const [state, county] = search.location_value.split(':');
      setSelectedState(state);
      setSelectedCounty(county);
      setSearchInput('');
    } else {
      setSearchInput(search.location_value);
      setSelectedState('');
      setSelectedCounty('');
    }
    
    toast.success(`Loaded search: ${search.name}`);
  };

  const handleSearchNews = async (locationValue?: string, locationDisplay?: string) => {
    const searchLocation = locationValue || (selectedState && selectedCounty ? `${selectedCounty}, ${states.find(s => s.code === selectedState)?.name}` : searchInput);
    const displayLocation = locationDisplay || searchLocation;
    
    if (!searchLocation.trim()) {
      toast.error("Please select state and county OR enter a city/state or zipcode");
      return;
    }

    setLoadingNews(true);
    setCurrentSearchLocation(displayLocation);
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-local-news', {
        body: {
          searchQuery: searchLocation,
          location: displayLocation
        }
      });

      if (error) {
        console.error('Error fetching news:', error);
        toast.error("Failed to fetch local news");
        return;
      }

      setNewsData(data);
      toast.success(`Found ${data.totalArticles} local news articles`);
    } catch (error) {
      console.error('Error calling news function:', error);
      toast.error("Failed to fetch local news");
    } finally {
      setLoadingNews(false);
    }
  };

  const handleQuickSearchNews = (search: SavedSearch) => {
    handleQuickSearch(search);
    handleSearchNews(search.location_value, search.location_display);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
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
          {/* State and County Selection */}
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

          {/* OR divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search by City, State or Zipcode</label>
            <Input
              placeholder="Enter city and state (e.g., Elgin, IL) or zipcode (e.g., 60120)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Save Search Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Name</label>
            <Input
              placeholder="Enter a name for this search"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveSearch} disabled={loading} variant="outline" className="flex-1">
              <BookmarkPlus className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Search"}
            </Button>
            <Button 
              onClick={() => handleSearchNews()} 
              disabled={loadingNews} 
              className="flex-1"
            >
              {loadingNews ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {loadingNews ? "Searching..." : "Search News"}
            </Button>
          </div>
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
                        {search.search_type === 'county' ? 'County' : 'Search'}
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
                      onClick={() => handleQuickSearchNews(search)}
                    >
                      <Search className="h-3 w-3 mr-1" />
                      Search
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

      {/* News Results */}
      {newsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Local News for {currentSearchLocation}</span>
              <Badge variant="outline">{newsData.totalArticles} total articles</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(newsData.categories).length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No News Found</h3>
                <p className="text-muted-foreground">
                  No local news articles found for this area. Try a different location.
                </p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {Object.entries(newsData.categories).map(([category, articles]) => (
                  <AccordionItem key={category} value={category} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{articles[0]?.icon}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold capitalize">{category}</span>
                          <Badge className={getPriorityColor(articles[0]?.priority)}>
                            {articles[0]?.priority} priority
                          </Badge>
                          <Badge variant="outline">{articles.length} articles</Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        {articles.map((article, index) => (
                          <div
                            key={index}
                            className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            {article.urlToImage && (
                              <img
                                src={article.urlToImage}
                                alt={article.title}
                                className="w-20 h-20 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium line-clamp-2 mb-2">
                                {article.title}
                              </h4>
                              {article.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {article.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{article.source.name}</span>
                                <span>{formatTimeAgo(article.publishedAt)}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="flex-shrink-0"
                            >
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Read
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocalNewsSearch;