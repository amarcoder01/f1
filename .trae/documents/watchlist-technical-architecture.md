# Watchlist Feature Technical Architecture

## 1. Architecture Overview

```mermaid
graph TD
    A[User Browser] --> B[React Watchlist Component]
    B --> C[Zustand Store]
    B --> D[Polygon API Service]
    B --> E[Stock API Service]
    C --> F[Database API Routes]
    F --> G[Prisma ORM]
    G --> H[PostgreSQL Database]
    D --> I[Polygon.io WebSocket]
    D --> J[Polygon.io REST API]
    
    subgraph "Frontend Layer"
        B
        C
    end
    
    subgraph "API Layer"
        D
        E
        F
    end
    
    subgraph "Data Layer"
        G
        H
    end
    
    subgraph "External Services"
        I
        J
    end
```

## 2. Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Framer Motion
- **State Management**: Zustand with persistence
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Data**: Polygon.io WebSocket API
- **Stock Data**: Polygon.io REST API

## 3. Component Architecture

### 3.1 Main Components

```typescript
// Component hierarchy
WatchlistPage
├── SearchSection
│   ├── SearchInput
│   ├── SearchResults
│   └── PopularStocks
├── WatchlistSummary
│   ├── TotalStocks
│   ├── Gainers
│   ├── Losers
│   └── AveragePrice
├── WatchlistGrid
│   └── StockCard[]
│       ├── PriceTicker
│       ├── StockInfo
│       └── RemoveButton
└── ErrorBoundary
```

### 3.2 Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant S as Store
    participant API as API Service
    participant DB as Database
    participant WS as WebSocket
    
    U->>C: Search for stock
    C->>API: searchUSStocks(query)
    API->>API: Filter US stocks only
    API-->>C: Return filtered results
    C->>U: Display search results
    
    U->>C: Add stock to watchlist
    C->>S: addToWatchlist(stock)
    S->>DB: Save to database
    DB-->>S: Confirm save
    S->>WS: Subscribe to real-time updates
    S-->>C: Update UI
    
    WS->>S: Real-time price update
    S->>C: Trigger re-render
    C->>U: Show updated prices
```

## 4. API Definitions

### 4.1 Watchlist API Routes

#### GET /api/watchlist
**Purpose**: Get user's watchlists

**Response**:
```typescript
interface WatchlistResponse {
  success: boolean
  data: Watchlist[]
}

interface Watchlist {
  id: string
  name: string
  items: WatchlistItem[]
  createdAt: string
  updatedAt: string
}
```

#### POST /api/watchlist
**Purpose**: Create new watchlist

**Request**:
```typescript
interface CreateWatchlistRequest {
  name: string
}
```

**Response**:
```typescript
interface CreateWatchlistResponse {
  success: boolean
  data: Watchlist
}
```

#### POST /api/watchlist/[id]/items
**Purpose**: Add stock to watchlist

**Request**:
```typescript
interface AddStockRequest {
  symbol: string
  name: string
  type: 'stock'
  price: number
  change: number
  changePercent: number
  exchange: string
  sector: string
  industry: string
  volume: number
  marketCap: number
}
```

**Response**:
```typescript
interface AddStockResponse {
  success: boolean
  data: WatchlistItem
}
```

#### DELETE /api/watchlist/[id]/items
**Purpose**: Remove stock from watchlist

**Query Parameters**:
- `symbol`: Stock symbol to remove

**Response**:
```typescript
interface RemoveStockResponse {
  success: boolean
  message: string
}
```

### 4.2 Stock Search API

#### GET /api/stocks/search
**Purpose**: Search for US stocks

**Query Parameters**:
- `q`: Search query (symbol, name, or sector)
- `limit`: Maximum results (default: 10)

**Response**:
```typescript
interface StockSearchResponse {
  success: boolean
  data: Stock[]
  total: number
}

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  sector: string
  industry: string
  exchange: 'NYSE' | 'NASDAQ' | 'OTC'
  dayHigh: number
  dayLow: number
  lastUpdated: string
}
```

#### GET /api/stocks/[symbol]
**Purpose**: Get detailed stock data

**Response**:
```typescript
interface StockDetailResponse {
  success: boolean
  data: Stock
}
```

## 5. Database Schema

### 5.1 Enhanced Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  settings      Json?
  watchlists    Watchlist[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Watchlist {
  id          String    @id @default(cuid())
  userId      String
  name        String
  items       WatchlistItem[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

model WatchlistItem {
  id            String    @id @default(cuid())
  watchlistId   String
  symbol        String
  name          String
  type          String    @default("stock")
  price         Float
  change        Float
  changePercent Float
  exchange      String?
  sector        String?
  industry      String?
  volume        BigInt?   @default(0)
  marketCap     BigInt?   @default(0)
  lastUpdated   DateTime  @default(now())
  createdAt     DateTime  @default(now())

  watchlist     Watchlist @relation(fields: [watchlistId], references: [id], onDelete: Cascade)
  
  @@unique([watchlistId, symbol])
  @@index([watchlistId])
  @@index([symbol])
}
```

### 5.2 Database Migration

```sql
-- Migration to add missing fields
ALTER TABLE "WatchlistItem" ADD COLUMN IF NOT EXISTS "exchange" VARCHAR(10);
ALTER TABLE "WatchlistItem" ADD COLUMN IF NOT EXISTS "sector" VARCHAR(100);
ALTER TABLE "WatchlistItem" ADD COLUMN IF NOT EXISTS "industry" VARCHAR(200);
ALTER TABLE "WatchlistItem" ADD COLUMN IF NOT EXISTS "volume" BIGINT DEFAULT 0;
ALTER TABLE "WatchlistItem" ADD COLUMN IF NOT EXISTS "marketCap" BIGINT DEFAULT 0;
ALTER TABLE "WatchlistItem" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_watchlist_user_id" ON "Watchlist"("userId");
CREATE INDEX IF NOT EXISTS "idx_watchlist_item_watchlist_id" ON "WatchlistItem"("watchlistId");
CREATE INDEX IF NOT EXISTS "idx_watchlist_item_symbol" ON "WatchlistItem"("symbol");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_watchlist_item_unique" ON "WatchlistItem"("watchlistId", "symbol");
```

## 6. Real-time Data Architecture

### 6.1 WebSocket Connection Management

```typescript
class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private subscribers = new Set<string>()
  private eventListeners = new Set<(data: any) => void>()
  
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    
    this.ws = new WebSocket('wss://socket.polygon.io/stocks')
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.authenticate()
      this.reconnectAttempts = 0
    }
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMessage(data)
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      this.handleReconnect()
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }
  
  private authenticate() {
    this.send({
      action: 'auth',
      params: process.env.NEXT_PUBLIC_POLYGON_API_KEY
    })
  }
  
  private handleMessage(data: any) {
    if (data[0]?.ev === 'status' && data[0]?.status === 'auth_success') {
      console.log('WebSocket authenticated')
      this.subscribeToSymbols()
    }
    
    if (data[0]?.ev === 'T') {
      this.notifyListeners(data[0])
    }
  }
  
  private subscribeToSymbols() {
    if (this.subscribers.size > 0) {
      this.send({
        action: 'subscribe',
        params: Array.from(this.subscribers).map(symbol => `T.${symbol}`).join(',')
      })
    }
  }
  
  subscribe(symbol: string) {
    this.subscribers.add(symbol)
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        action: 'subscribe',
        params: `T.${symbol}`
      })
    }
  }
  
  unsubscribe(symbol: string) {
    this.subscribers.delete(symbol)
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send({
        action: 'unsubscribe',
        params: `T.${symbol}`
      })
    }
  }
  
  addListener(callback: (data: any) => void) {
    this.eventListeners.add(callback)
    return () => this.eventListeners.delete(callback)
  }
  
  private notifyListeners(data: any) {
    this.eventListeners.forEach(listener => listener(data))
  }
  
  private send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }
  
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }
}
```

### 6.2 Real-time Data Integration

```typescript
// Hook for real-time updates
const useRealTimeUpdates = (symbols: string[]) => {
  const updateWatchlistItem = useWatchlistStore(state => state.updateWatchlistItemPrice)
  
  useEffect(() => {
    const wsManager = WebSocketManager.getInstance()
    wsManager.connect()
    
    // Subscribe to symbols
    symbols.forEach(symbol => wsManager.subscribe(symbol))
    
    // Listen for updates
    const unsubscribe = wsManager.addListener((data) => {
      if (data.ev === 'T') {
        const { sym: symbol, p: price, c: change } = data
        const changePercent = (change / (price - change)) * 100
        
        // Update store
        updateWatchlistItem(symbol, price, change, changePercent)
      }
    })
    
    return () => {
      symbols.forEach(symbol => wsManager.unsubscribe(symbol))
      unsubscribe()
    }
  }, [symbols, updateWatchlistItem])
}
```

## 7. Error Handling Strategy

### 7.1 Error Types

```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

interface AppError {
  type: ErrorType
  message: string
  details?: any
  timestamp: Date
}
```

### 7.2 Error Handling Hook

```typescript
const useErrorHandler = () => {
  const [errors, setErrors] = useState<AppError[]>([])
  
  const addError = (error: Omit<AppError, 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      timestamp: new Date()
    }
    
    setErrors(prev => [...prev, newError])
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e !== newError))
    }, 5000)
  }
  
  const removeError = (error: AppError) => {
    setErrors(prev => prev.filter(e => e !== error))
  }
  
  const clearErrors = () => {
    setErrors([])
  }
  
  return { errors, addError, removeError, clearErrors }
}
```

## 8. Performance Optimizations

### 8.1 Memoization Strategy

```typescript
// Memoized components
const StockCard = memo(({ stock, onRemove }: StockCardProps) => {
  return (
    <Card>
      <PriceTicker stock={stock} />
      <Button onClick={() => onRemove(stock.symbol)}>
        Remove
      </Button>
    </Card>
  )
})

// Memoized selectors
const selectWatchlistItems = (state: WatchlistStore) => state.watchlists[0]?.items || []
const selectFilteredItems = createSelector(
  [selectWatchlistItems, (state, searchQuery) => searchQuery],
  (items, searchQuery) => {
    if (!searchQuery) return items
    return items.filter(item => 
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
)
```

### 8.2 Virtual Scrolling

```typescript
// For large watchlists
const VirtualizedWatchlist = ({ items }: { items: WatchlistItem[] }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end)
  }, [items, visibleRange])
  
  return (
    <div className="virtual-list">
      {visibleItems.map(item => (
        <StockCard key={item.id} stock={item} />
      ))}
    </div>
  )
}
```

## 9. Testing Architecture

### 9.1 Test Structure

```
__tests__/
├── components/
│   ├── WatchlistPage.test.tsx
│   ├── StockCard.test.tsx
│   └── SearchSection.test.tsx
├── hooks/
│   ├── useRealTimeUpdates.test.ts
│   └── useErrorHandler.test.ts
├── services/
│   ├── polygonAPI.test.ts
│   └── stockAPI.test.ts
├── store/
│   └── watchlistStore.test.ts
└── api/
    ├── watchlist.test.ts
    └── stocks.test.ts
```

### 9.2 Mock Strategy

```typescript
// Mock Polygon API
jest.mock('@/lib/polygon-api', () => ({
  polygonAPI: {
    advancedSearchUSStocks: jest.fn(),
    getUSStockData: jest.fn(),
    startWebSocketConnection: jest.fn(),
    addEventListener: jest.fn()
  }
}))

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: WebSocket.OPEN
}))
```

## 10. Deployment Configuration

### 10.1 Environment Variables

```bash
# Production environment
NEXT_PUBLIC_POLYGON_API_KEY=your_polygon_api_key
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://yourdomain.com

# Development environment
NEXT_PUBLIC_POLYGON_API_KEY=your_dev_polygon_api_key
DATABASE_URL=postgresql://localhost:5432/watchlist_dev
```

### 10.2 Build Configuration

```javascript
// next.config.js
module.exports = {
  env: {
    POLYGON_API_KEY: process.env.NEXT_PUBLIC_POLYGON_API_KEY,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    return config
  },
}
```

This technical architecture provides a comprehensive blueprint for implementing a robust, scalable, and maintainable watchlist feature with real-time data capabilities.