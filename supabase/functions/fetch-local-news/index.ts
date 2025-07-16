import { corsHeaders } from '../_shared/cors.ts'

const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY')

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
}

interface NewsResponse {
  articles: NewsArticle[]
  totalResults: number
}

// News categories with keywords for classification
const NEWS_CATEGORIES = {
  weather: {
    priority: 'high',
    keywords: ['weather', 'storm', 'rain', 'snow', 'tornado', 'hurricane', 'flood', 'temperature', 'forecast', 'climate'],
    icon: '🌤️'
  },
  emergency: {
    priority: 'high',
    keywords: ['emergency', 'alert', 'evacuation', 'fire', 'accident', 'crash', 'incident', 'rescue', 'ambulance'],
    icon: '🚨'
  },
  traffic: {
    priority: 'medium',
    keywords: ['road closure', 'traffic', 'highway', 'construction', 'detour', 'interstate', 'bridge'],
    icon: '🚧'
  },
  disaster: {
    priority: 'high',
    keywords: ['disaster', 'earthquake', 'wildfire', 'flooding', 'explosion', 'collapse', 'outbreak'],
    icon: '⚠️'
  },
  economic: {
    priority: 'low',
    keywords: ['business', 'economy', 'market', 'employment', 'jobs', 'budget', 'tax'],
    icon: '💼'
  },
  local: {
    priority: 'medium',
    keywords: ['local', 'community', 'school', 'government', 'council', 'mayor', 'election'],
    icon: '🏛️'
  }
}

function categorizeArticle(article: NewsArticle): { category: string; priority: string; icon: string } {
  const text = `${article.title} ${article.description}`.toLowerCase()
  
  // Check each category for keyword matches
  for (const [categoryName, categoryData] of Object.entries(NEWS_CATEGORIES)) {
    const hasKeyword = categoryData.keywords.some(keyword => text.includes(keyword))
    if (hasKeyword) {
      return {
        category: categoryName,
        priority: categoryData.priority,
        icon: categoryData.icon
      }
    }
  }
  
  // Default category
  return {
    category: 'local',
    priority: 'medium',
    icon: '📰'
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!NEWS_API_KEY) {
      console.error('NEWS_API_KEY not found')
      return new Response(
        JSON.stringify({ error: 'News API key not configured' }),
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

    console.log('Fetching news for:', { searchQuery, location })

    // Build search query - prioritize location-based news
    let query = location || searchQuery
    
    // Add location context if we have both
    if (location && searchQuery) {
      query = `${location} ${searchQuery}`
    }

    // Fetch news from NewsAPI
    const newsUrl = new URL('https://newsapi.org/v2/everything')
    newsUrl.searchParams.set('q', query)
    newsUrl.searchParams.set('language', 'en')
    newsUrl.searchParams.set('sortBy', 'publishedAt')
    newsUrl.searchParams.set('pageSize', '50') // Get more articles for better categorization
    newsUrl.searchParams.set('apiKey', NEWS_API_KEY)

    console.log('Fetching from NewsAPI:', newsUrl.toString())

    const response = await fetch(newsUrl.toString())
    
    if (!response.ok) {
      console.error('NewsAPI error:', response.status, await response.text())
      return new Response(
        JSON.stringify({ error: 'Failed to fetch news data' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const newsData: NewsResponse = await response.json()
    console.log(`Found ${newsData.articles.length} articles`)

    // Categorize and organize articles
    const categorizedNews: Record<string, any[]> = {}
    
    newsData.articles.forEach(article => {
      const { category, priority, icon } = categorizeArticle(article)
      
      if (!categorizedNews[category]) {
        categorizedNews[category] = []
      }
      
      categorizedNews[category].push({
        ...article,
        priority,
        icon,
        category: category.charAt(0).toUpperCase() + category.slice(1)
      })
    })

    // Sort categories by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 }
    const sortedCategories = Object.entries(categorizedNews).sort(([, articlesA], [, articlesB]) => {
      const priorityA = priorityOrder[articlesA[0]?.priority as keyof typeof priorityOrder] || 3
      const priorityB = priorityOrder[articlesB[0]?.priority as keyof typeof priorityOrder] || 3
      return priorityA - priorityB
    })

    const result = {
      location: location || searchQuery,
      totalArticles: newsData.totalResults,
      categories: sortedCategories.reduce((acc, [category, articles]) => {
        acc[category] = articles.slice(0, 5) // Limit to 5 articles per category
        return acc
      }, {} as Record<string, any[]>),
      timestamp: new Date().toISOString()
    }

    console.log('Returning categorized news:', Object.keys(result.categories))

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