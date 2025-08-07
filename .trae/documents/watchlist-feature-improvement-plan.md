# Watchlist Feature Improvement Plan

## 1. Current Issues Analysis

### 1.1 Critical Problems Identified
- **Missing Import**: `stockAPI` is referenced but not imported in watchlist page
- **Polygon API Authentication**: Using hardcoded API key instead of environment variable
- **WebSocket Implementation**: Real-time updates not properly connected
- **Search Functionality**: Broken due to missing API integration
- **Error Handling**: Insufficient error states and loading indicators
- **Type Mismatches**: Store expects different data structure than API provides

### 1.2 Current Architecture Issues
- Polygon API key hardcoded in source code (security risk)
- WebSocket connection not properly managed
- Search results not filtered for US stocks only
- Database integration incomplete
- Real-time updates not synchronized with store

## 2. Implementation Plan

### 2.1 Fix Stock Search Functionality

#### Problem
The watchlist page references `stockAPI` which doesn't exist in imports, causing search to fail.

#### Solution
```typescript
// Fix import in watchlist page
import { polygonAPI } from '@/lib/polygon-api'
import { stockAPI } from '@/lib/stock-api'

// Update search implementation
const searchStocks = async () => {
  if (!searchQuery || searchQuery.length < 1) {
    setSearchResults([])
    return
  }

  setIsSearching(true)
  try {
    // Use polygonAPI for real data
    const results = await polygonAPI.advancedSearchUSStocks(searchQuery)
    setSearchResults(results)
  } catch (error) {
    console.error('Search error:', error)
    setSearchResults([])
    // Show error notification
  } finally {
    setIsSearching(false)
  }
}
```

### 2.2 Fix Polygon API Configuration

#### Problem
API key is hardcoded in source code, should use environment variable.

#### Solution
```typescript
// Update polygon-api.ts
const POLYGON_API_KEY = process.env.POLYGON_ACCESS_KEY_ID || process.env.NEXT_PUBLIC_POLYGON_API_KEY

if (!POLYGON_API_KEY) {
  console.warn('Polygon API key not found in environment variables')
}
```

### 2.3 Implement Proper Real-time Data Updates

#### Current Issues
- WebSocket connection not authenticated
- Real-time updates not synchronized with store
- No reconnection logic

#### Solution
```typescript
// Enhanced WebSocket implementation
export class PolygonStockAPI {
  private static ws: WebSocket | null = null
  private static reconnectAttempts = 0
  private static maxReconnectAttempts = 5
  private static reconnectDelay = 1000

  public startWebSocketConnection() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return
    
    this.ws = new WebSocket(`wss://socket.polygon.io/stocks`)
    
    this.ws.onopen = () => {
      console.log('Polygon WebSocket connected')
      this.reconnectAttempts = 0
      
      // Authenticate with API key
      this.ws?.send(JSON.stringify({
        action: 'auth',
        params: POLYGON_API_KEY
      }))
    }
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data[0]?.ev === 'status' && data[0]?.status === 'auth_success') {
        console.log('WebSocket authenticated successfully')
        // Subscribe to all tickers
        this.ws?.send(JSON.stringify({
          action: 'subscribe',
          params: 'T.*'
        }))
      }
      
      if (data[0]?.ev === 'T') {
        // Handle real-time trade data
        this.handleTradeUpdate(data[0])
      }
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.handleReconnect()
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }
  
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
        this.startWebSocketConnection()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }
  
  private handleTradeUpdate(trade: any) {
    // Update store with real-time data
    const { updateWatchlistItemPrice } = useWatchlistStore.getState()
    // Implementation details...
  }
}
```

### 2.4 Improve Database Integration

#### Add Missing Fields to Database Schema
```sql
-- Add missing fields to WatchlistItem
ALTER TABLE "WatchlistItem" ADD COLUMN "exchange" VARCHAR(10);
ALTER TABLE "WatchlistItem" ADD COLUMN "sector" VARCHAR(100);
ALTER TABLE "WatchlistItem" ADD COLUMN "industry" VARCHAR(100);
ALTER TABLE "WatchlistItem" ADD COLUMN "volume" BIGINT DEFAULT 0;
ALTER TABLE "WatchlistItem" ADD COLUMN "marketCap" BIGINT DEFAULT 0;
```

#### Update Database Service
```typescript
// Enhanced addToWatchlist method
static async addToWatchlist(watchlistId: string, stockData: {
  symbol: string
  name: string
  type: string
  price: number
  change: number
  changePercent: number
  exchange?: string
  sector?: string
  industry?: string
  volume?: number
  marketCap?: number
}) {
  try {
    const existingItem = await prisma.watchlistItem.findFirst({
      where: { watchlistId, symbol: stockData.symbol }
    })

    if (existingItem) {
      return await prisma.watchlistItem.update({
        where: { id: existingItem.id },
        data: {
          ...stockData,
          lastUpdated: new Date()
        }
      })
    } else {
      return await prisma.watchlistItem.create({
        data: {
          watchlistId,
          ...stockData,
          lastUpdated: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error)
    throw error
  }
}
```

### 2.5 Enhanced Error Handling and Loading States

#### Add Comprehensive Error Handling
```typescript
// Enhanced error handling in watchlist page
const [errors, setErrors] = useState<{
  search?: string
  watchlist?: string
  realtime?: string
}>({})

const handleError = (type: keyof typeof errors, message: string) => {
  setErrors(prev => ({ ...prev, [type]: message }))
  // Auto-clear error after 5 seconds
  setTimeout(() => {
    setErrors(prev => ({ ...prev, [type]: undefined }))
  }, 5000)
}

// Error display component
const ErrorDisplay = ({ error, onDismiss }: { error: string, onDismiss: () => void }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
    <div className="flex items-center justify-between">
      <p className="text-red-700 text-sm">{error}</p>
      <Button variant="ghost" size="sm" onClick={onDismiss}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  </div>
)
```

#### Improved Loading States
```typescript
// Enhanced loading states
const [loadingStates, setLoadingStates] = useState({
  search: false,
  addStock: false,
  removeStock: false,
  realtime: false
})

const setLoading = (key: keyof typeof loadingStates, value: boolean) => {
  setLoadingStates(prev => ({ ...prev, [key]: value }))
}
```

### 2.6 US Stock Filtering Enhancement

#### Strict US Stock Validation
```typescript
// Enhanced US stock filtering
const isValidUSStock = (stock: any): boolean => {
  const validExchanges = ['XNYS', 'XNAS', 'BATS', 'NYSE', 'NASDAQ']
  const validMarkets = ['stocks']
  
  return (
    stock.locale === 'us' &&
    validMarkets.includes(stock.market) &&
    validExchanges.includes(stock.primary_exchange || stock.exchange) &&
    stock.active === true &&
    stock.type === 'CS' // Common Stock
  )
}

// Filter search results
const filterUSStocks = (stocks: any[]): Stock[] => {
  return stocks
    .filter(isValidUSStock)
    .map(stock => ({
      symbol: stock.ticker || stock.symbol,
      name: stock.name,
      price: stock.price || 0,
      change: stock.change || 0,
      changePercent: stock.changePercent || 0,
      volume: stock.volume || 0,
      marketCap: stock.market_cap || 0,
      sector: getSectorFromSIC(stock.sic_description),
      industry: stock.sic_description || 'Unknown',
      exchange: mapExchange(stock.primary_exchange || stock.exchange),
      // ... other required fields
    }))
}
```

## 3. Performance Optimizations

### 3.1 Caching Strategy
```typescript
// Implement intelligent caching
class StockDataCache {
  private cache = new Map<string, { data: Stock; timestamp: number }>()
  private readonly CACHE_DURATION = 60000 // 1 minute
  
  get(symbol: string): Stock | null {
    const cached = this.cache.get(symbol)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }
  
  set(symbol: string, data: Stock): void {
    this.cache.set(symbol, { data, timestamp: Date.now() })
  }
  
  clear(): void {
    this.cache.clear()
  }
}
```

### 3.2 Debounced Search
```typescript
// Implement proper debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Use in search
const debouncedSearchQuery = useDebounce(searchQuery, 300)
```

## 4. Security Improvements

### 4.1 Environment Variables
```bash
# Add to .env
NEXT_PUBLIC_POLYGON_API_KEY=your_polygon_api_key
POLYGON_SECRET_KEY=your_secret_key
```

### 4.2 API Rate Limiting
```typescript
// Implement rate limiting
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests: number
  private readonly timeWindow: number
  
  constructor(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindowMs
  }
  
  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.timeWindow)
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now)
      return true
    }
    
    return false
  }
}
```

## 5. Testing Strategy

### 5.1 Unit Tests
```typescript
// Test polygon API
describe('PolygonAPI', () => {
  test('should search US stocks only', async () => {
    const results = await polygonAPI.advancedSearchUSStocks('AAPL')
    expect(results).toHaveLength(1)
    expect(results[0].symbol).toBe('AAPL')
    expect(['NYSE', 'NASDAQ'].includes(results[0].exchange)).toBe(true)
  })
  
  test('should handle search errors gracefully', async () => {
    const results = await polygonAPI.advancedSearchUSStocks('')
    expect(results).toEqual([])
  })
})
```

### 5.2 Integration Tests
```typescript
// Test watchlist functionality
describe('Watchlist Integration', () => {
  test('should add stock to watchlist', async () => {
    const stock = await polygonAPI.getUSStockData('AAPL')
    const result = await DatabaseService.addToWatchlist('test-watchlist', stock)
    expect(result.symbol).toBe('AAPL')
  })
})
```

## 6. Deployment Checklist

- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Test API connectivity
- [ ] Verify WebSocket authentication
- [ ] Test search functionality
- [ ] Validate real-time updates
- [ ] Check error handling
- [ ] Performance testing
- [ ] Security audit
- [ ] User acceptance testing

## 7. Monitoring and Maintenance

### 7.1 Logging
```typescript
// Enhanced logging
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data)
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error)
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data)
  }
}
```

### 7.2 Health Checks
```typescript
// API health check endpoint
export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Test Polygon API
    const testStock = await polygonAPI.getUSStockData('AAPL')
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      polygonAPI: testStock ? 'connected' : 'error',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    )
  }
}
```

This comprehensive plan addresses all the critical issues in the current watchlist implementation and provides a roadmap for creating a fully functional, real-time stock watchlist feature with proper error handling, security, and performance optimizations.