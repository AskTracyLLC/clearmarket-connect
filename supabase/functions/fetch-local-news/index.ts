import { corsHeaders } from '../_shared/cors.ts'

const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY')

interface WeatherAlert {
  event: string
  description: string
  start: number
  end: number
  severity: string
  sender_name: string
}

interface WeatherCurrent {
  temp: number
  feels_like: number
  humidity: number
  wind_speed: number
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
}

interface WeatherForecast {
  dt: number
  temp: {
    min: number
    max: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  pop: number
}

interface WeatherResponse {
  lat: number
  lon: number
  current: WeatherCurrent
  alerts?: WeatherAlert[]
  daily: WeatherForecast[]
}

interface GeocodingResponse {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}

// Weather categories with priorities
const WEATHER_CATEGORIES = {
  alerts: {
    priority: 'high',
    icon: '🚨',
    title: 'Weather Alerts'
  },
  current: {
    priority: 'medium',
    icon: '🌤️',
    title: 'Current Conditions'
  },
  forecast: {
    priority: 'low',
    icon: '📅',
    title: 'Daily Forecast'
  }
}

async function getCoordinates(location: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    let queryLocation = location;
    
    // If the location looks like a US zipcode (5 digits), add country code
    if (/^\d{5}$/.test(location.trim())) {
      queryLocation = `${location.trim()},US`;
      console.log(`Converted zipcode ${location} to ${queryLocation}`);
    }
    
    const geocodeUrl = new URL('https://api.openweathermap.org/geo/1.0/direct')
    geocodeUrl.searchParams.set('q', queryLocation)
    geocodeUrl.searchParams.set('limit', '1')
    geocodeUrl.searchParams.set('appid', OPENWEATHER_API_KEY!)

    console.log(`Geocoding query: ${geocodeUrl.toString()}`);

    const response = await fetch(geocodeUrl.toString())
    if (!response.ok) {
      console.error(`Geocoding API error: ${response.status}`)
      return null
    }

    const data: GeocodingResponse[] = await response.json()
    console.log(`Geocoding results:`, data);
    
    if (data.length === 0) return null

    const result = data[0]
    return {
      lat: result.lat,
      lon: result.lon,
      name: `${result.name}${result.state ? `, ${result.state}` : ''}, ${result.country}`
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

function formatWeatherData(weather: WeatherResponse, locationName: string) {
  const categories: Record<string, any[]> = {}

  // Weather Alerts (High Priority)
  if (weather.alerts && weather.alerts.length > 0) {
    categories.alerts = weather.alerts.map(alert => ({
      title: alert.event,
      description: alert.description,
      severity: alert.severity,
      start: new Date(alert.start * 1000).toISOString(),
      end: new Date(alert.end * 1000).toISOString(),
      source: { name: alert.sender_name },
      priority: 'high',
      icon: '🚨',
      category: 'Weather Alerts',
      url: `https://openweathermap.org/city/${weather.lat},${weather.lon}`
    }))
  }

  // Current Conditions (Medium Priority)
  const currentWeather = weather.current
  categories.current = [{
    title: `Current Weather in ${locationName}`,
    description: `${Math.round(currentWeather.temp)}°F, ${currentWeather.weather[0].description}. Feels like ${Math.round(currentWeather.feels_like)}°F. Humidity: ${currentWeather.humidity}%, Wind: ${Math.round(currentWeather.wind_speed)} mph`,
    temperature: Math.round(currentWeather.temp),
    feelsLike: Math.round(currentWeather.feels_like),
    humidity: currentWeather.humidity,
    windSpeed: Math.round(currentWeather.wind_speed),
    condition: currentWeather.weather[0].main,
    conditionDescription: currentWeather.weather[0].description,
    weatherIcon: currentWeather.weather[0].icon,
    priority: 'medium',
    icon: '🌤️',
    category: 'Current Conditions',
    url: `https://openweathermap.org/city/${weather.lat},${weather.lon}`,
    publishedAt: new Date().toISOString(),
    source: { name: 'OpenWeatherMap' }
  }]

  // Daily Forecast (Low Priority)
  categories.forecast = weather.daily.slice(0, 5).map((day, index) => ({
    title: index === 0 ? 'Today\'s Forecast' : `${new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })} Forecast`,
    description: `High: ${Math.round(day.temp.max)}°F, Low: ${Math.round(day.temp.min)}°F. ${day.weather[0].description}. Chance of precipitation: ${Math.round(day.pop * 100)}%`,
    highTemp: Math.round(day.temp.max),
    lowTemp: Math.round(day.temp.min),
    condition: day.weather[0].main,
    conditionDescription: day.weather[0].description,
    precipitationChance: Math.round(day.pop * 100),
    weatherIcon: day.weather[0].icon,
    date: new Date(day.dt * 1000).toISOString(),
    priority: 'low',
    icon: '📅',
    category: 'Daily Forecast',
    url: `https://openweathermap.org/city/${weather.lat},${weather.lon}`,
    publishedAt: new Date(day.dt * 1000).toISOString(),
    source: { name: 'OpenWeatherMap' }
  }))

  return categories
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!OPENWEATHER_API_KEY) {
      console.error('OPENWEATHER_API_KEY not found')
      return new Response(
        JSON.stringify({ error: 'OpenWeather API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { searchQuery, location } = await req.json()
    
    if (!searchQuery && !location) {
      return new Response(
        JSON.stringify({ error: 'Search query or location is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const query = location || searchQuery
    console.log('Fetching weather for:', query)

    // Get coordinates for the location
    const coords = await getCoordinates(query)
    if (!coords) {
      return new Response(
        JSON.stringify({ error: 'Location not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Found coordinates:', coords)

    // Fetch weather data from OpenWeatherMap
    const weatherUrl = new URL('https://api.openweathermap.org/data/3.0/onecall')
    weatherUrl.searchParams.set('lat', coords.lat.toString())
    weatherUrl.searchParams.set('lon', coords.lon.toString())
    weatherUrl.searchParams.set('exclude', 'minutely,hourly')
    weatherUrl.searchParams.set('units', 'imperial')
    weatherUrl.searchParams.set('appid', OPENWEATHER_API_KEY)

    console.log('Fetching from OpenWeatherMap:', weatherUrl.toString())

    const response = await fetch(weatherUrl.toString())
    
    if (!response.ok) {
      console.error('OpenWeatherMap error:', response.status, await response.text())
      return new Response(
        JSON.stringify({ error: 'Failed to fetch weather data' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const weatherData: WeatherResponse = await response.json()
    console.log('Weather data received:', {
      alerts: weatherData.alerts?.length || 0,
      current: !!weatherData.current,
      daily: weatherData.daily?.length || 0
    })

    // Format weather data into categories
    const categorizedWeather = formatWeatherData(weatherData, coords.name)

    // Count total weather items
    const totalItems = Object.values(categorizedWeather).reduce((sum, items) => sum + items.length, 0)

    // Sort categories by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 }
    const sortedCategories = Object.entries(categorizedWeather).sort(([, itemsA], [, itemsB]) => {
      const priorityA = priorityOrder[itemsA[0]?.priority as keyof typeof priorityOrder] || 3
      const priorityB = priorityOrder[itemsB[0]?.priority as keyof typeof priorityOrder] || 3
      return priorityA - priorityB
    })

    const result = {
      location: coords.name,
      totalArticles: totalItems,
      categories: sortedCategories.reduce((acc, [category, items]) => {
        acc[category] = items
        return acc
      }, {} as Record<string, any[]>),
      timestamp: new Date().toISOString()
    }

    console.log('Returning categorized weather:', Object.keys(result.categories))

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in fetch-local-news function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})