// Polygon.io API Integration for US Stock Data
import { Stock } from '@/types'

// Polygon.io configuration
const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY
const POLYGON_BASE_URL = 'https://api.polygon.io'

// API key validation
if (!POLYGON_API_KEY || POLYGON_API_KEY.trim() === '') {
  console.error('❌ Polygon API key not found! Please:')
  console.error('1. Sign up at https://polygon.io')
  console.error('2. Get your API key from https://polygon.io/dashboard')
  console.error('3. Add it to your .env file: POLYGON_API_KEY=your_actual_api_key')
}

// Helper function to make authenticated requests with enhanced error handling
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  if (!POLYGON_API_KEY || POLYGON_API_KEY.trim() === '') {
    throw new Error('Polygon API key is required. Please add POLYGON_API_KEY to your .env file.')
  }

  // Add API key as query parameter (Polygon.io preferred method)
  const urlWithKey = new URL(url)
  urlWithKey.searchParams.set('apikey', POLYGON_API_KEY)

  try {
    const response = await fetch(urlWithKey.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Polygon API error: ${response.status} ${response.statusText}`
      
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        // Ignore JSON parsing errors, use default message
      }

      if (response.status === 401) {
        throw new Error('Invalid or expired Polygon API key. Please check your API key or regenerate it from https://polygon.io/dashboard')
      } else if (response.status === 403) {
        throw new Error('Access forbidden. Your API key may not have permission for this endpoint or you may need a paid subscription.')
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making more requests or upgrade your subscription.')
      } else if (response.status >= 500) {
        throw new Error('Polygon API server error. Please try again later.')
      } else {
        throw new Error(errorMessage)
      }
    }

    return response
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Polygon API. Please check your internet connection.')
    }
    throw error
  }
}

// Polygon API response interfaces
interface PolygonQuoteResponse {
  status: string
  results?: {
    P: number  // Ask price
    S: number  // Ask size
    p: number  // Bid price
    s: number  // Bid size
    t: number  // Timestamp
  }[]
}

interface PolygonTickerResponse {
  status: string
  results?: Array<{
    ticker: string
    name: string
    market: string
    locale: string
    primary_exchange: string
    type: string
    active: boolean
    currency_name: string
    cik?: string
    composite_figi?: string
    share_class_figi?: string
    last_updated_utc?: string
  }>
  next_url?: string
}

interface PolygonSnapshotResponse {
  status: string
  results?: Array<{
    value: {
      ticker: string
      todaysChangePerc: number
      todaysChange: number
      updated: number
      timeframe: string
      min?: {
        av: number  // Average volume
        c: number   // Close
        h: number   // High
        l: number   // Low
        o: number   // Open
        t: number   // Timestamp
        v: number   // Volume
        vw: number  // Volume weighted average price
      }
      prevDay?: {
        c: number   // Previous close
        h: number   // High
        l: number   // Low
        o: number   // Open
        v: number   // Volume
        vw: number  // Volume weighted average price
      }
      day?: {
        c: number   // Close
        h: number   // High
        l: number   // Low
        o: number   // Open
        v: number   // Volume
        vw: number  // Volume weighted average price
      }
    }
  }>
}

interface PolygonTickerDetailsResponse {
  status: string
  results?: {
    ticker: string
    name: string
    market: string
    locale: string
    primary_exchange: string
    type: string
    active: boolean
    currency_name: string
    cik?: string
    composite_figi?: string
    share_class_figi?: string
    market_cap?: number
    phone_number?: string
    address?: {
      address1?: string
      city?: string
      state?: string
      postal_code?: string
    }
    description?: string
    sic_code?: string
    sic_description?: string
    ticker_root?: string
    homepage_url?: string
    total_employees?: number
    list_date?: string
    branding?: {
      logo_url?: string
      icon_url?: string
    }
    share_class_shares_outstanding?: number
    weighted_shares_outstanding?: number
  }
}

export class PolygonStockAPI {
  private static instance: PolygonStockAPI
  private static cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 60000 // 1 minute cache
  // Real-time data configuration for paid plan
  private static isDelayedMode = false // Use real-time data for paid plan
  private static restPollingInterval: NodeJS.Timeout | null = null
  private static subscribedSymbols: Set<string> = new Set()
  private static delayedDataPollingInterval = 15 * 60 * 1000 // Fallback polling interval
  private static lastDataUpdate = Date.now()
  private static dataDelayMinutes = 0 // Real-time data, no delay
  // WebSocket management properties
  private static ws: WebSocket | null = null
  private static isFreeTier = false
  private static wsAuthenticationFailed = false
  private static wsConnectionAttempts = 0
  private static maxConnectionAttempts = 5
  private static eventListeners: Array<(event: MessageEvent) => void> = []

  // Public method to start real-time WebSocket connection for paid plan
  public startRealTimeWebSocketConnection() {
    console.log('🚀 Starting real-time WebSocket connection for paid plan')
    PolygonStockAPI.startWebSocket()
  }

  // Public method to start WebSocket (used by store)
  public startWebSocket() {
    PolygonStockAPI.startWebSocket()
  }

  // Public method to start real-time data polling for paid plan
  public startRealTimeDataPolling() {
    if (PolygonStockAPI.restPollingInterval) return
    console.log('🚀 Starting real-time data polling for paid plan')
    this.startRestPolling()
  }

  // Public method to check if using delayed data mode
  public isUsingDelayedData(): boolean {
    return PolygonStockAPI.isDelayedMode
  }

  // Get data delay information
  public getDataDelay(): { delayMinutes: number; lastUpdate: Date } {
    return {
      delayMinutes: PolygonStockAPI.dataDelayMinutes,
      lastUpdate: new Date(PolygonStockAPI.lastDataUpdate)
    }
  }

  // Public method to subscribe to specific symbols (WebSocket for $29 plan, REST fallback)
  public subscribeToSymbols(symbols: string[]) {
    // Add symbols to subscription list
    symbols.forEach(symbol => PolygonStockAPI.subscribedSymbols.add(symbol.toUpperCase()))
    
    console.log(`📊 Subscribing to symbols: ${symbols.join(', ')}`)
    
    // Try WebSocket first for $29 plan (supports 15 connections)
    if (!PolygonStockAPI.ws && !PolygonStockAPI.wsAuthenticationFailed) {
      console.log('🚀 Attempting WebSocket connection for real-time data')
      PolygonStockAPI.startWebSocket()
    } else if (PolygonStockAPI.ws && PolygonStockAPI.ws.readyState === WebSocket.OPEN) {
      // WebSocket is connected, subscribe to new symbols
      console.log('📡 Adding symbols to existing WebSocket subscription')
      symbols.forEach(symbol => {
        PolygonStockAPI.ws?.send(JSON.stringify({
          action: 'subscribe',
          params: `T.${symbol},AM.${symbol}`
        }))
      })
    } else {
      // Fallback to REST API polling
      console.log('🔄 Using REST API polling as fallback')
      this.startRestPolling()
    }
  }

  // Start WebSocket connection for real-time data ($29 starter plan supports 15 connections)
  private static startWebSocket() {
    if (PolygonStockAPI.ws) {
      console.log('WebSocket already exists')
      return
    }

    console.log('🚀 Starting WebSocket connection for $29 starter plan (15 connections limit)')
    
    try {
      // Use the stocks WebSocket endpoint for $29 plan
      PolygonStockAPI.ws = new WebSocket('wss://socket.polygon.io/stocks')
      
      PolygonStockAPI.ws.onopen = () => {
        console.log('✅ WebSocket connected, authenticating...')
        
        // Authenticate with API key
        PolygonStockAPI.ws?.send(JSON.stringify({
          action: 'auth',
          params: POLYGON_API_KEY
        }))
      }
      
      PolygonStockAPI.ws.onmessage = (event) => {
        try {
          const messages = JSON.parse(event.data)
          const messageArray = Array.isArray(messages) ? messages : [messages]
          
          for (const message of messageArray) {
            console.log('📨 WebSocket message:', message)
            
            // Handle authentication
            if (message.ev === 'status') {
              if (message.status === 'auth_success') {
                console.log('✅ WebSocket authentication successful')
                PolygonStockAPI.wsAuthenticationFailed = false
                PolygonStockAPI.isFreeTier = false
                
                // Subscribe to subscribed symbols
                if (PolygonStockAPI.subscribedSymbols.size > 0) {
                  const symbols = Array.from(PolygonStockAPI.subscribedSymbols)
                  console.log(`📊 Subscribing to ${symbols.length} symbols via WebSocket`)
                  
                  // Subscribe to trades and aggregates for each symbol
                  symbols.forEach(symbol => {
                    PolygonStockAPI.ws?.send(JSON.stringify({
                      action: 'subscribe',
                      params: `T.${symbol},AM.${symbol}`
                    }))
                  })
                }
              } else if (message.status === 'auth_failed') {
                console.log('❌ WebSocket authentication failed, falling back to REST API')
                PolygonStockAPI.wsAuthenticationFailed = true
                PolygonStockAPI.isFreeTier = true
                PolygonStockAPI.ws?.close()
              }
            }
            
            // Handle trade data
            if (message.ev === 'T') {
              const { sym: symbol, p: price, t: timestamp } = message
              if (symbol && typeof price === 'number') {
                // Update cache
                PolygonStockAPI.updateStockCache(symbol, {
                  price,
                  lastUpdated: new Date(timestamp).toISOString()
                })
                
                // Notify listeners
                PolygonStockAPI.eventListeners.forEach(listener => {
                  try {
                    listener(event)
                  } catch (error) {
                    console.error('Error in event listener:', error)
                  }
                })
              }
            }
            
            // Handle aggregate data
            if (message.ev === 'AM') {
              const { sym: symbol, c: close, v: volume, t: timestamp } = message
              if (symbol && typeof close === 'number') {
                // Update cache
                PolygonStockAPI.updateStockCache(symbol, {
                  price: close,
                  volume,
                  lastUpdated: new Date(timestamp).toISOString()
                })
                
                // Notify listeners
                PolygonStockAPI.eventListeners.forEach(listener => {
                  try {
                    listener(event)
                  } catch (error) {
                    console.error('Error in event listener:', error)
                  }
                })
              }
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      PolygonStockAPI.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        PolygonStockAPI.wsAuthenticationFailed = true
        PolygonStockAPI.isFreeTier = true
      }
      
      PolygonStockAPI.ws.onclose = () => {
        console.log('🔌 WebSocket connection closed')
        PolygonStockAPI.ws = null
        
        // Fallback to REST API polling
        if (PolygonStockAPI.subscribedSymbols.size > 0) {
          console.log('🔄 Falling back to REST API polling')
          const instance = PolygonStockAPI.getInstance()
          instance.startRestPolling()
        }
      }
      
    } catch (error) {
      console.error('❌ Error creating WebSocket:', error)
      PolygonStockAPI.wsAuthenticationFailed = true
      PolygonStockAPI.isFreeTier = true
    }
  }



  // Helper method to update stock cache with real-time data
  private static updateStockCache(symbol: string, data: any) {
    if (!symbol) return
    
    const cachedData = PolygonStockAPI.cache.get(symbol)
    if (cachedData) {
      const updatedData = {
        ...cachedData.data,
        ...data,
        lastUpdated: new Date().toISOString()
      }
      PolygonStockAPI.cache.set(symbol, {
        data: updatedData,
        timestamp: Date.now()
      })
    } else {
      // Create new cache entry if it doesn't exist
      PolygonStockAPI.cache.set(symbol, {
        data: {
          symbol,
          ...data,
          lastUpdated: new Date().toISOString()
        },
        timestamp: Date.now()
      })
    }
  }

  // Check if WebSocket is connected
  public isWebSocketConnected(): boolean {
    return PolygonStockAPI.ws !== null && PolygonStockAPI.ws.readyState === WebSocket.OPEN
  }

  // Add event listener for WebSocket messages
  public addEventListener(listener: (event: MessageEvent) => void): () => void {
    if (!PolygonStockAPI.ws && !PolygonStockAPI.wsAuthenticationFailed) {
      PolygonStockAPI.startWebSocket()
    }
    PolygonStockAPI.eventListeners.push(listener)
    return () => {
      const index = PolygonStockAPI.eventListeners.indexOf(listener)
      if (index > -1) {
        PolygonStockAPI.eventListeners.splice(index, 1)
      }
    }
  }

  // Start REST API polling for real-time-like updates
  private startRestPolling() {
    // Don't start multiple polling intervals
    if (PolygonStockAPI.restPollingInterval) {
      return
    }

    // Only poll if we have subscribed symbols
    if (PolygonStockAPI.subscribedSymbols.size === 0) {
      return
    }

    console.log('Starting REST API polling for regular updates ($29 plan)')
    
    const pollInterval = 30000 // 30 seconds interval for $29 plan to avoid rate limits
    
    PolygonStockAPI.restPollingInterval = setInterval(async () => {
      try {
        const symbols = Array.from(PolygonStockAPI.subscribedSymbols)
        if (symbols.length === 0) {
          this.stopRestPolling()
          return
        }

        // Update cache for subscribed symbols
        const updatePromises = symbols.map(async (symbol) => {
          try {
            const stockData = await this.getUSStockData(symbol)
            if (stockData) {
              // Simulate WebSocket event for consistency
              const mockEvent = new MessageEvent('message', {
                data: JSON.stringify([{
                  ev: 'T',
                  sym: symbol,
                  p: stockData.price,
                  t: Date.now()
                }])
              })
              
              // Notify listeners
              PolygonStockAPI.eventListeners.forEach(listener => {
                try {
                  listener(mockEvent)
                } catch (error) {
                  console.error('Error in event listener:', error)
                }
              })
            }
          } catch (error) {
            console.error(`Error polling data for ${symbol}:`, error)
          }
        })

        await Promise.all(updatePromises)
      } catch (error) {
        console.error('Error in REST polling:', error)
      }
    }, pollInterval)
  }

  // Stop REST API polling
  private stopRestPolling() {
    if (PolygonStockAPI.restPollingInterval) {
      clearInterval(PolygonStockAPI.restPollingInterval)
      PolygonStockAPI.restPollingInterval = null
      console.log('Stopped REST API polling')
    }
  }

  // Unsubscribe from symbols
  public unsubscribeFromSymbols(symbols: string[]) {
    symbols.forEach(symbol => PolygonStockAPI.subscribedSymbols.delete(symbol.toUpperCase()))
    
    console.log(`📊 Unsubscribing from REST API polling for symbols: ${symbols.join(', ')}`)
    
    // Stop polling if no more subscribed symbols
    if (PolygonStockAPI.subscribedSymbols.size === 0) {
      this.stopRestPolling()
    }
  }

  // Get subscription status and tier information
  public getConnectionInfo() {
    return {
      isWebSocketConnected: this.isWebSocketConnected(),
      isFreeTier: PolygonStockAPI.isFreeTier,
      wsAuthenticationFailed: PolygonStockAPI.wsAuthenticationFailed,
      connectionAttempts: PolygonStockAPI.wsConnectionAttempts,
      subscribedSymbols: Array.from(PolygonStockAPI.subscribedSymbols),
      isPolling: Boolean(PolygonStockAPI.restPollingInterval)
    }
  }

  static getInstance(): PolygonStockAPI {
    if (!PolygonStockAPI.instance) {
      PolygonStockAPI.instance = new PolygonStockAPI()
    }
    return PolygonStockAPI.instance
  }

  // Search for US stocks by ticker or name (optimized for $29 plan)
  async searchUSStocks(query: string): Promise<Stock[]> {
    if (!query || query.length < 1) return []

    try {
      const searchTerm = query.toUpperCase().trim()
      console.log(`🔍 Searching for stocks: "${searchTerm}"`)
      
      // First try exact ticker match for efficiency
      if (searchTerm.length <= 5 && /^[A-Z]+$/.test(searchTerm)) {
        try {
          const exactStock = await this.getUSStockData(searchTerm)
          if (exactStock) {
            console.log(`✅ Found exact match: ${searchTerm}`)
            return [exactStock]
          }
        } catch (error) {
          console.log(`❌ Exact match failed for ${searchTerm}, trying broader search`)
        }
      }
      
      // Search for tickers using the authenticated request helper
      const response = await makeAuthenticatedRequest(
        `${POLYGON_BASE_URL}/v3/reference/tickers?search=${encodeURIComponent(searchTerm)}&market=stocks&active=true&limit=15`
      )

      const data: PolygonTickerResponse = await response.json()
      
      if (!data.results || data.results.length === 0) {
        console.log(`❌ No results found for search term: ${searchTerm}`)
        return []
      }

      console.log(`📊 Found ${data.results.length} raw results for "${searchTerm}"`)

      // Filter for US stocks with optimized criteria for $29 plan
      const usStocks = data.results.filter(ticker => {
        // Basic US stock criteria
        const isUSStock = ticker.locale === 'us' && 
                         ticker.market === 'stocks' &&
                         ticker.active
        
        // Focus on common stock types for better results
        const validStockTypes = ['CS', 'ADRC', 'ADRP', 'PFD']
        const hasValidType = validStockTypes.includes(ticker.type)
        
        // Major US exchanges only to stay within limits
        const validExchanges = [
          'XNYS', // NYSE
          'XNAS', // NASDAQ
          'BATS', // BATS
          'ARCX'  // NYSE Arca
        ]
        const hasValidExchange = validExchanges.includes(ticker.primary_exchange)
        
        // Search relevance
        const matchesTicker = ticker.ticker.toUpperCase().includes(searchTerm)
        const matchesName = ticker.name?.toUpperCase().includes(searchTerm) || false
        
        return isUSStock && hasValidType && hasValidExchange && (matchesTicker || matchesName)
      })

      console.log(`✅ Filtered to ${usStocks.length} US stocks`)

      // Limit to 8 results to stay within $29 plan API limits
      const limitedStocks = usStocks.slice(0, 8)
      
      // Get current prices for found stocks with rate limiting
      const stockPromises = limitedStocks.map(async (ticker, index) => {
        try {
          // Add small delay between requests to avoid rate limits
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          
          const stockData = await this.getUSStockData(ticker.ticker)
          return stockData
        } catch (error) {
          console.error(`❌ Error fetching data for ${ticker.ticker}:`, error)
          return null
        }
      })

      const results = await Promise.all(stockPromises)
      const validResults = results.filter(stock => stock !== null) as Stock[]
      
      console.log(`✅ Successfully fetched data for ${validResults.length} stocks`)
      return validResults

    } catch (error) {
      console.error('❌ Error searching US stocks:', error)
      throw error
    }
  }

  // Get detailed US stock data with real-time updates
  async getUSStockData(symbol: string): Promise<Stock | null> {
    if (!symbol) return null

    try {
      // Check cache first
      const cached = PolygonStockAPI.cache.get(symbol)
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data as Stock
      }

      // WebSocket disabled for $29 plan - using REST API only

      const ticker = symbol.toUpperCase()

      // Get current snapshot data
      const snapshotResponse = await makeAuthenticatedRequest(
        `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`
      )

      const snapshotData: PolygonSnapshotResponse = await snapshotResponse.json()
      
      if (!snapshotData.results || snapshotData.results.length === 0) {
        return null
      }

      const snapshot = snapshotData.results[0].value

      // Get ticker details for company info
      let details: PolygonTickerDetailsResponse['results'] = undefined
      try {
        const detailsResponse = await makeAuthenticatedRequest(
          `${POLYGON_BASE_URL}/v3/reference/tickers/${ticker}`
        )
        const detailsData: PolygonTickerDetailsResponse = await detailsResponse.json()
        details = detailsData.results
      } catch (error) {
        console.warn(`Could not fetch details for ${ticker}:`, error)
      }

      // Extract data
      const currentPrice = snapshot.day?.c || snapshot.prevDay?.c || 0
      const previousClose = snapshot.prevDay?.c || currentPrice
      const change = snapshot.todaysChange || (currentPrice - previousClose)
      const changePercent = snapshot.todaysChangePerc || ((change / previousClose) * 100)

      // Determine exchange
      let exchange: 'NYSE' | 'NASDAQ' | 'OTC' = 'NASDAQ'
      if (details?.primary_exchange === 'XNYS') {
        exchange = 'NYSE'
      } else if (details?.primary_exchange === 'XNAS') {
        exchange = 'NASDAQ'
      } else {
        exchange = 'OTC'
      }

      // Map to our Stock interface
      const stock: Stock = {
        symbol: ticker,
        name: details?.name || `${ticker} Inc.`,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: snapshot.day?.v || snapshot.prevDay?.v || 0,
        marketCap: details?.market_cap || 0,
        pe: 0, // Not provided by current endpoint
        dividend: 0, // Not provided by current endpoint
        sector: this.getSectorFromSIC(details?.sic_description || ''),
        industry: details?.sic_description || 'Unknown',
        exchange: exchange,
        dayHigh: snapshot.day?.h || snapshot.prevDay?.h || currentPrice,
        dayLow: snapshot.day?.l || snapshot.prevDay?.l || currentPrice,
        fiftyTwoWeekHigh: 0, // Not provided by current endpoint
        fiftyTwoWeekLow: 0, // Not provided by current endpoint
        avgVolume: snapshot.min?.av || snapshot.day?.v || 0,
        dividendYield: 0, // Not provided by current endpoint
        beta: 0, // Not provided by current endpoint
        eps: 0, // Not provided by current endpoint
        lastUpdated: new Date().toISOString()
      }

      // Cache the result
      PolygonStockAPI.cache.set(symbol, { data: stock, timestamp: Date.now() })

      return stock

    } catch (error) {
      console.error(`Error fetching US stock data for ${symbol}:`, error)
      return null
    }
  }

  // Get multiple US stocks
  async getUSStocks(symbols: string[]): Promise<Stock[]> {
    const promises = symbols.map(symbol => this.getUSStockData(symbol))
    const results = await Promise.all(promises)
    return results.filter(stock => stock !== null) as Stock[]
  }

  // Advanced search that includes company names
  async advancedSearchUSStocks(query: string): Promise<Stock[]> {
    if (!query || query.length < 2) return []

    try {
      const searchTerm = query.trim()
      
      // First try exact ticker match
      if (searchTerm.length <= 5 && /^[A-Z]+$/i.test(searchTerm)) {
        const exactStock = await this.getUSStockData(searchTerm)
        if (exactStock) {
          return [exactStock]
        }
      }

      // Then try broader search
      const results = await this.searchUSStocks(searchTerm)
      
      // Sort results by relevance
      return results.sort((a, b) => {
        const aSymbolMatch = a.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        const bSymbolMatch = b.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        const aNameMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase())
        const bNameMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase())
        
        // Exact symbol match first
        if (a.symbol.toLowerCase() === searchTerm.toLowerCase()) return -1
        if (b.symbol.toLowerCase() === searchTerm.toLowerCase()) return 1
        
        // Symbol starts with query
        if (aSymbolMatch && !bSymbolMatch) return -1
        if (!aSymbolMatch && bSymbolMatch) return 1
        
        // Name match
        if (aNameMatch && !bNameMatch) return -1
        if (!aNameMatch && bNameMatch) return 1
        
        return 0
      })

    } catch (error) {
      console.error('Error in advanced search:', error)
      return []
    }
  }

  // Helper function to map SIC description to sector
  private getSectorFromSIC(sicDescription: string): string {
    const desc = sicDescription.toLowerCase()
    
    if (desc.includes('software') || desc.includes('computer') || desc.includes('technology') || desc.includes('internet')) {
      return 'Technology'
    } else if (desc.includes('pharmaceutical') || desc.includes('medical') || desc.includes('health') || desc.includes('biotechnology')) {
      return 'Healthcare'
    } else if (desc.includes('bank') || desc.includes('financial') || desc.includes('insurance') || desc.includes('investment')) {
      return 'Financials'
    } else if (desc.includes('retail') || desc.includes('consumer') || desc.includes('restaurant') || desc.includes('automotive')) {
      return 'Consumer Discretionary'
    } else if (desc.includes('energy') || desc.includes('oil') || desc.includes('gas') || desc.includes('petroleum')) {
      return 'Energy'
    } else if (desc.includes('manufacturing') || desc.includes('industrial') || desc.includes('aerospace') || desc.includes('defense')) {
      return 'Industrials'
    } else if (desc.includes('telecommunication') || desc.includes('media') || desc.includes('entertainment') || desc.includes('broadcasting')) {
      return 'Communication Services'
    } else if (desc.includes('food') || desc.includes('beverage') || desc.includes('household') || desc.includes('personal care')) {
      return 'Consumer Staples'
    } else if (desc.includes('utility') || desc.includes('electric') || desc.includes('water') || desc.includes('gas distribution')) {
      return 'Utilities'
    } else if (desc.includes('real estate') || desc.includes('reit') || desc.includes('property')) {
      return 'Real Estate'
    } else if (desc.includes('mining') || desc.includes('chemical') || desc.includes('materials') || desc.includes('metals')) {
      return 'Materials'
    } else {
      return 'Unknown'
    }
  }

  // Get popular US stocks
  async getPopularUSStocks(): Promise<Stock[]> {
    const popularTickers = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'JNJ', 'V',
      'PG', 'UNH', 'HD', 'MA', 'BAC', 'ABBV', 'PFE', 'KO', 'NFLX', 'DIS'
    ]
    
    return this.getUSStocks(popularTickers)
  }
}

// Export singleton instance
export const polygonAPI = PolygonStockAPI.getInstance()