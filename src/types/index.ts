// Trading Data Types - Stocks Only (US Markets)
export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  dividend: number
  sector: string
  industry: string
  exchange: 'NYSE' | 'NASDAQ' | 'OTC'
  dayHigh: number
  dayLow: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  avgVolume: number
  dividendYield: number
  beta: number
  eps: number
  lastUpdated: string
}

// Trading Data Types - Forex
export interface Forex {
  symbol: string
  baseCurrency: string
  quoteCurrency: string
  price: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: string
}

// Trading Data Types - Cryptocurrencies
export interface Crypto {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  circulatingSupply: number
  totalSupply: number
  lastUpdated: string
}

// Trading Data Types - Commodities
export interface Commodity {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: string
}

// Chart Data Types
export interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface LineData {
  time: number
  value: number
}

export interface VolumeData {
  time: number
  value: number
  color: string
}

// Watchlist Types - Stocks Only
export interface WatchlistItem {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  type: 'stock'
  exchange: 'NYSE' | 'NASDAQ' | 'OTC'
  sector: string
  industry: string
  volume: number
  marketCap: number
  addedAt: Date
}

export interface Watchlist {
  id: string
  name: string
  items: WatchlistItem[]
  createdAt: Date
  updatedAt: Date
}

// Portfolio Types
export interface Position {
  id: string
  symbol: string
  name: string
  quantity: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  type: 'stock'
  exchange: 'NYSE' | 'NASDAQ' | 'OTC'
  sector: string
}

export interface Portfolio {
  id: string
  name: string
  positions: Position[]
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  cash: number
  createdAt: Date
  updatedAt: Date
}

// Order Types
export interface Order {
  id: string
  symbol: string
  type: 'market' | 'limit' | 'stop' | 'stop-limit'
  side: 'buy' | 'sell'
  quantity: number
  price?: number
  stopPrice?: number
  status: 'pending' | 'filled' | 'cancelled' | 'rejected'
  filledQuantity: number
  averagePrice: number
  createdAt: Date
  updatedAt: Date
}

// News Types
export interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  url: string
  source: string
  publishedAt: Date
  symbols: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
}

// AI Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    symbols?: string[]
    analysis?: any
  }
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

// UI State Types
export interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  activeTab: string
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  currency: string
  timezone: string
  notifications: {
    priceAlerts: boolean
    newsAlerts: boolean
    orderUpdates: boolean
  }
  chartSettings: {
    defaultTimeframe: string
    defaultIndicators: string[]
    colorScheme: 'light' | 'dark'
  }
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Real-time Data Types
export interface RealTimeData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: Date
}

export interface WebSocketMessage {
  type: 'price_update' | 'order_update' | 'news_update' | 'chat_message'
  data: any
  timestamp: Date
}