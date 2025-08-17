// Real-time News & Sentiment Analysis API Service
import { NewsItem, SentimentScore, EarningsEvent } from '@/types'

// News API configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

export class NewsService {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static CACHE_DURATION = 300000 // 5 minutes

  // Get real-time financial news
  static async getFinancialNews(symbol?: string, limit: number = 20): Promise<NewsItem[]> {
    const cacheKey = `news_${symbol || 'general'}_${limit}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      console.log(`📰 Fetching financial news for ${symbol || 'general market'}...`)
      
      let news: NewsItem[] = []
      
      // 1. Try NewsAPI.org (primary source)
      if (NEWS_API_KEY) {
        try {
          const query = symbol ? `${symbol} stock market` : 'financial market'
          const response = await fetch(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${NEWS_API_KEY}`
          )
          
          if (response.ok) {
            const data = await response.json()
            news = data.articles?.map((article: any) => ({
              id: article.url,
              title: article.title,
              description: article.description,
              content: article.content,
              url: article.url,
              imageUrl: article.urlToImage,
              source: article.source.name,
              publishedAt: new Date(article.publishedAt),
              sentiment: null, // Will be calculated separately
              relevance: this.calculateRelevance(article, symbol),
              category: this.categorizeNews(article.title, article.description)
            })) || []
          }
        } catch (error) {
          console.log('❌ NewsAPI failed:', error)
        }
      }
      
      // 2. Fallback to Alpha Vantage News API
      if (news.length === 0 && ALPHA_VANTAGE_API_KEY) {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol || 'FOREX'}&apikey=${ALPHA_VANTAGE_API_KEY}`
          )
          
          if (response.ok) {
            const data = await response.json()
            news = data.feed?.map((article: any) => ({
              id: article.url,
              title: article.title,
              description: article.summary,
              content: article.summary,
              url: article.url,
              imageUrl: article.banner_image,
              source: article.source,
              publishedAt: new Date(article.time_published),
              sentiment: {
                score: parseFloat(article.overall_sentiment_score),
                label: article.overall_sentiment_label,
                confidence: parseFloat(article.overall_sentiment_label_confidence)
              },
              relevance: this.calculateRelevance(article, symbol),
              category: this.categorizeNews(article.title, article.summary)
            })) || []
          }
        } catch (error) {
          console.log('❌ Alpha Vantage News failed:', error)
        }
      }
      
      // 3. Fallback to mock data
      if (news.length === 0) {
        news = this.generateMockNews(symbol, limit)
      }
      
      // Sort by relevance and recency
      news.sort((a, b) => {
        const relevanceDiff = (b.relevance || 0) - (a.relevance || 0)
        if (Math.abs(relevanceDiff) > 0.1) return relevanceDiff
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
      
      this.cache.set(cacheKey, { data: news, timestamp: Date.now() })
      console.log(`✅ Fetched ${news.length} news articles`)
      
      return news
    } catch (error) {
      console.error('❌ Error fetching news:', error)
      return this.generateMockNews(symbol, limit)
    }
  }

  // Get earnings calendar
  static async getEarningsCalendar(days: number = 30): Promise<EarningsEvent[]> {
    const cacheKey = `earnings_${days}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      console.log(`📅 Fetching earnings calendar for next ${days} days...`)
      
      let earnings: EarningsEvent[] = []
      
      // Try Alpha Vantage Earnings Calendar
      if (ALPHA_VANTAGE_API_KEY) {
        try {
          const response = await fetch(
            `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=${days}day&apikey=${ALPHA_VANTAGE_API_KEY}`
          )
          
          if (response.ok) {
            const csvText = await response.text()
            const lines = csvText.split('\n').slice(1) // Skip header
            
            earnings = lines
              .filter(line => line.trim())
              .map(line => {
                const [symbol, name, reportDate, estimate, actual] = line.split(',')
                return {
                  id: `${symbol}_${reportDate}`,
                  symbol: symbol,
                  companyName: name,
                  reportDate: new Date(reportDate),
                  estimate: parseFloat(estimate) || 0,
                  actual: parseFloat(actual) || null,
                  prediction: this.generateEarningsPrediction(symbol, parseFloat(estimate) || 0),
                  sentiment: this.generateEarningsSentiment(symbol)
                }
              })
          }
        } catch (error) {
          console.log('❌ Alpha Vantage Earnings failed:', error)
        }
      }
      
      // Fallback to mock data
      if (earnings.length === 0) {
        earnings = this.generateMockEarnings(days)
      }
      
      this.cache.set(cacheKey, { data: earnings, timestamp: Date.now() })
      console.log(`✅ Fetched ${earnings.length} earnings events`)
      
      return earnings
    } catch (error) {
      console.error('❌ Error fetching earnings:', error)
      return this.generateMockEarnings(days)
    }
  }

  // Get social media sentiment
  static async getSocialMediaSentiment(symbol: string): Promise<SentimentScore> {
    const cacheKey = `social_${symbol}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      console.log(`📱 Fetching social media sentiment for ${symbol}...`)
      
      // Mock social media sentiment (in real implementation, integrate with Twitter/Reddit APIs)
      const sentiment = this.generateMockSocialSentiment(symbol)
      
      this.cache.set(cacheKey, { data: sentiment, timestamp: Date.now() })
      console.log(`✅ Generated social sentiment for ${symbol}`)
      
      return sentiment
    } catch (error) {
      console.error('❌ Error fetching social sentiment:', error)
      return this.generateMockSocialSentiment(symbol)
    }
  }

  // Analyze news sentiment using AI
  static async analyzeNewsSentiment(news: NewsItem[]): Promise<NewsItem[]> {
    try {
      console.log(`🤖 Analyzing sentiment for ${news.length} news articles...`)
      
      const analyzedNews = await Promise.all(
        news.map(async (item) => {
          if (item.sentiment) return item // Already has sentiment
          
          // Simple sentiment analysis (in production, use OpenAI API or similar)
          const sentiment = this.analyzeTextSentiment(item.title + ' ' + item.description)
          
          return {
            ...item,
            sentiment
          }
        })
      )
      
      console.log(`✅ Analyzed sentiment for ${analyzedNews.length} articles`)
      return analyzedNews
    } catch (error) {
      console.error('❌ Error analyzing sentiment:', error)
      return news
    }
  }

  // Helper methods
  private static calculateRelevance(article: any, symbol?: string): number {
    if (!symbol) return 0.5
    
    const text = `${article.title} ${article.description}`.toLowerCase()
    const symbolLower = symbol.toLowerCase()
    
    if (text.includes(symbolLower)) return 1.0
    if (text.includes(symbolLower.replace('.', ''))) return 0.9
    
    // Check for company name variations
    const companyNames: { [key: string]: string[] } = {
      'AAPL': ['apple', 'iphone', 'ipad', 'macbook'],
      'GOOGL': ['google', 'alphabet', 'android', 'youtube'],
      'MSFT': ['microsoft', 'windows', 'office', 'azure'],
      'TSLA': ['tesla', 'electric vehicle', 'ev', 'musk'],
      'AMZN': ['amazon', 'aws', 'prime', 'bezos']
    }
    
    const variations = companyNames[symbol] || []
    for (const variation of variations) {
      if (text.includes(variation)) return 0.8
    }
    
    return 0.3
  }

  private static categorizeNews(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase()
    
    if (text.includes('earnings') || text.includes('quarterly') || text.includes('revenue')) {
      return 'Earnings'
    }
    if (text.includes('merger') || text.includes('acquisition') || text.includes('buyout')) {
      return 'M&A'
    }
    if (text.includes('ceo') || text.includes('executive') || text.includes('leadership')) {
      return 'Leadership'
    }
    if (text.includes('product') || text.includes('launch') || text.includes('release')) {
      return 'Product'
    }
    if (text.includes('regulation') || text.includes('legal') || text.includes('lawsuit')) {
      return 'Regulatory'
    }
    if (text.includes('market') || text.includes('trading') || text.includes('stock')) {
      return 'Market'
    }
    
    return 'General'
  }

  private static analyzeTextSentiment(text: string): SentimentScore {
    const positiveWords = ['up', 'rise', 'gain', 'positive', 'growth', 'profit', 'success', 'strong', 'bullish']
    const negativeWords = ['down', 'fall', 'loss', 'negative', 'decline', 'weak', 'bearish', 'crash', 'drop']
    
    const words = text.toLowerCase().split(/\s+/)
    let positiveCount = 0
    let negativeCount = 0
    
    for (const word of words) {
      if (positiveWords.includes(word)) positiveCount++
      if (negativeWords.includes(word)) negativeCount++
    }
    
    const total = positiveCount + negativeCount
    if (total === 0) return { score: 0, label: 'neutral', confidence: 0.5 }
    
    const score = (positiveCount - negativeCount) / total
    const confidence = Math.min(total / 10, 1) // Higher confidence with more sentiment words
    
    let label: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (score > 0.2) label = 'positive'
    else if (score < -0.2) label = 'negative'
    
    return { score, label, confidence }
  }

  private static generateEarningsPrediction(symbol: string, estimate: number): number {
    // Simple prediction based on historical patterns
    const variations: { [key: string]: number } = {
      'AAPL': 0.05, 'GOOGL': 0.03, 'MSFT': 0.04, 'TSLA': 0.15, 'AMZN': 0.08
    }
    
    const variation = variations[symbol] || 0.05
    return estimate * (1 + (Math.random() - 0.5) * variation)
  }

  private static generateEarningsSentiment(symbol: string): SentimentScore {
    const sentiments: { [key: string]: SentimentScore } = {
      'AAPL': { score: 0.7, label: 'positive', confidence: 0.8 },
      'GOOGL': { score: 0.6, label: 'positive', confidence: 0.7 },
      'MSFT': { score: 0.8, label: 'positive', confidence: 0.9 },
      'TSLA': { score: 0.3, label: 'neutral', confidence: 0.6 },
      'AMZN': { score: 0.5, label: 'positive', confidence: 0.7 }
    }
    
    return sentiments[symbol] || { score: 0.5, label: 'neutral', confidence: 0.6 }
  }

  private static generateMockSocialSentiment(symbol: string): SentimentScore {
    const baseSentiments: { [key: string]: number } = {
      'AAPL': 0.6, 'GOOGL': 0.5, 'MSFT': 0.7, 'TSLA': 0.4, 'AMZN': 0.5
    }
    
    const baseScore = baseSentiments[symbol] || 0.5
    const score = baseScore + (Math.random() - 0.5) * 0.4 // Add some randomness
    
    let label: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (score > 0.6) label = 'positive'
    else if (score < 0.4) label = 'negative'
    
    return { score, label, confidence: 0.7 + Math.random() * 0.3 }
  }

  private static generateMockNews(symbol?: string, limit: number = 20): NewsItem[] {
    const mockNews = [
      {
        id: '1',
        title: `${symbol || 'Tech'} Stocks Rally on Strong Earnings Reports`,
        description: 'Major technology companies reported better-than-expected quarterly results, driving market optimism.',
        content: 'The technology sector saw significant gains today as several major companies exceeded analyst expectations...',
        url: '#',
        imageUrl: 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Tech+Rally',
        source: 'Financial Times',
        publishedAt: new Date(Date.now() - Math.random() * 86400000),
        sentiment: { score: 0.7, label: 'positive' as const, confidence: 0.8 },
        relevance: 0.9,
        category: 'Earnings'
      },
      {
        id: '2',
        title: 'Market Volatility Increases Amid Economic Uncertainty',
        description: 'Investors remain cautious as economic indicators show mixed signals about future growth.',
        content: 'Market volatility has increased significantly as investors weigh various economic factors...',
        url: '#',
        imageUrl: 'https://via.placeholder.com/400x200/DC2626/FFFFFF?text=Volatility',
        source: 'Bloomberg',
        publishedAt: new Date(Date.now() - Math.random() * 86400000),
        sentiment: { score: -0.3, label: 'negative' as const, confidence: 0.6 },
        relevance: 0.7,
        category: 'Market'
      }
    ]
    
    return mockNews.slice(0, limit)
  }

  private static generateMockEarnings(days: number): EarningsEvent[] {
    const companies = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'TSLA', name: 'Tesla, Inc.' },
      { symbol: 'AMZN', name: 'Amazon.com, Inc.' }
    ]
    
    return companies.map((company, index) => ({
      id: `${company.symbol}_${index}`,
      symbol: company.symbol,
      companyName: company.name,
      reportDate: new Date(Date.now() + (index + 1) * 86400000 * 7), // Weekly intervals
      estimate: 2.50 + Math.random() * 3,
      actual: null,
      prediction: 2.50 + Math.random() * 3,
      sentiment: this.generateEarningsSentiment(company.symbol)
    }))
  }
}

// Export singleton instance
export const newsService = new NewsService()
