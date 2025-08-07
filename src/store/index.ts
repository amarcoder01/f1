import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  UIState, 
  UserSettings, 
  Watchlist, 
  Portfolio, 
  ChatSession,
  Stock,
  WatchlistItem,
  RealTimeData,
  Crypto,
  Forex,
  Commodity
} from '@/types'

// UI Store
interface UIStore extends UIState {
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setActiveTab: (tab: string) => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: 'system',
      activeTab: 'dashboard',
      notifications: [],
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      addNotification: (notification) => set((state) => ({
        notifications: [
          ...state.notifications,
          {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
          }
        ]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        activeTab: state.activeTab,
      }),
    }
  )
)

// Settings Store
interface SettingsStore {
  settings: UserSettings
  updateSettings: (settings: Partial<UserSettings>) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: {
        theme: 'system',
        currency: 'USD',
        timezone: 'UTC',
        notifications: {
          priceAlerts: true,
          newsAlerts: true,
          orderUpdates: true,
        },
        chartSettings: {
          defaultTimeframe: '1D',
          defaultIndicators: ['SMA', 'EMA'],
          colorScheme: 'dark',
        },
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'settings-store'
    }
  )
)

// Watchlist Store
interface WatchlistStore {
  watchlists: Watchlist[]
  activeWatchlist: string | null
  isLoading: boolean
  isConnectedToRealTime: boolean
  createWatchlist: (name: string) => Promise<void>
  addWatchlist: (watchlist: Watchlist) => void
  removeWatchlist: (id: string) => Promise<void>
  addToWatchlist: (watchlistId: string, item: WatchlistItem) => Promise<void>
  removeFromWatchlist: (watchlistId: string, itemId: string) => Promise<void>
  updateWatchlistItem: (watchlistId: string, itemId: string, updates: Partial<WatchlistItem>) => void
  updateWatchlistItemPrice: (watchlistId: string, itemId: string, price: number, change: number, changePercent: number) => void
  setActiveWatchlist: (id: string | null) => void
  loadWatchlists: () => Promise<void>
  startRealTimeUpdates: () => void
  stopRealTimeUpdates: () => void
  updatePriceFromWebSocket: (symbol: string, price: number, change: number, changePercent: number) => void
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      watchlists: [] as Watchlist[],
      activeWatchlist: null,
      isLoading: false,
      isConnectedToRealTime: false,
      
      loadWatchlists: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/watchlist')
          if (response.ok) {
            const { data } = await response.json()
            set({ watchlists: data, isLoading: false })
          } else {
            console.error('Failed to load watchlists')
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Error loading watchlists:', error)
          set({ isLoading: false })
        }
      },
      
      createWatchlist: async (name: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
          })
          
          if (response.ok) {
            const { data } = await response.json()
            set((state) => ({
              watchlists: [...state.watchlists, data],
              isLoading: false
            }))
          } else {
            console.error('Failed to create watchlist')
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Error creating watchlist:', error)
          set({ isLoading: false })
        }
      },
      
      addWatchlist: (watchlist: Watchlist) => set((state: WatchlistStore) => ({
        watchlists: [...state.watchlists, {
          ...watchlist,
          updatedAt: new Date()
        }]
      })),
      
      removeWatchlist: async (id: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`/api/watchlist/${id}`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            set((state) => ({
              watchlists: state.watchlists.filter(w => w.id !== id),
              isLoading: false
            }))
          } else {
            console.error('Failed to remove watchlist')
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Error removing watchlist:', error)
          set({ isLoading: false })
        }
      },
      
      addToWatchlist: async (watchlistId: string, item: WatchlistItem) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`/api/watchlist/${watchlistId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              symbol: item.symbol,
              name: item.name,
              type: item.type,
              price: item.price,
              change: item.change,
              changePercent: item.changePercent,
              exchange: item.exchange,
              sector: item.sector,
              industry: item.industry,
              volume: item.volume,
              marketCap: item.marketCap,
            })
          })
          
          if (response.ok) {
            const { data } = await response.json()
            const newItem = { ...item, id: data.id, lastUpdated: new Date(data.lastUpdated) }
            
            set((state) => ({
              watchlists: state.watchlists.map(w =>
                w.id === watchlistId
                  ? { 
                      ...w,
                      items: [...w.items, newItem],
                      updatedAt: new Date()
                    }
                  : w
              ),
              isLoading: false
            }))
          } else {
            console.error('Failed to add item to watchlist')
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Error adding item to watchlist:', error)
          set({ isLoading: false })
        }
      },
      
      removeFromWatchlist: async (watchlistId: string, itemId: string) => {
        set({ isLoading: true })
        try {
          // Get the item to find its symbol
          const watchlist = get().watchlists.find(w => w.id === watchlistId)
          const item = watchlist?.items.find(i => i.id === itemId)
          
          if (!item) {
            set({ isLoading: false })
            return
          }
          
          const response = await fetch(`/api/watchlist/${watchlistId}/items?symbol=${item.symbol}`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            set((state) => ({
              watchlists: state.watchlists.map(w =>
                w.id === watchlistId
                  ? {
                      ...w,
                      items: w.items.filter(i => i.id !== itemId),
                      updatedAt: new Date()
                    }
                  : w
              ),
              isLoading: false
            }))
          } else {
            console.error('Failed to remove item from watchlist')
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Error removing item from watchlist:', error)
          set({ isLoading: false })
        }
      },
      
      updateWatchlistItem: (watchlistId: string, itemId: string, updates: Partial<WatchlistItem>) => set((state: WatchlistStore) => ({
        watchlists: state.watchlists.map(w =>
          w.id === watchlistId
            ? {
                ...w,
                items: w.items.map(i =>
                  i.id === itemId ? { ...i, ...updates, lastUpdated: new Date().toISOString() } : i
                ),
                updatedAt: new Date()
              }
            : w
        )
      })),
      
      updateWatchlistItemPrice: (watchlistId: string, itemId: string, price: number, change: number, changePercent: number) => set((state: WatchlistStore) => ({
        watchlists: state.watchlists.map(w =>
          w.id === watchlistId
            ? {
                ...w,
                items: w.items.map(i =>
                  i.id === itemId ? { 
                    ...i, 
                    price,
                    change,
                    changePercent,
                    lastUpdated: new Date().toISOString()
                  } : i
                ),
                updatedAt: new Date()
              }
            : w
        )
      })),
      
      setActiveWatchlist: (id: string | null) => set((state: WatchlistStore) => ({ activeWatchlist: id })),
      
      startRealTimeUpdates: () => {
        try {
          const { polygonAPI } = require('@/lib/polygon-api')
          
          // Start WebSocket connection
          polygonAPI.startWebSocket()
          
          // Subscribe to all symbols in watchlists
          const allSymbols = get().watchlists.flatMap(w => w.items.map(item => item.symbol))
          if (allSymbols.length > 0) {
            polygonAPI.subscribeToSymbols(allSymbols)
          }
          
          // Add event listener for real-time updates
          const cleanup = polygonAPI.addEventListener((event: MessageEvent) => {
            try {
              const data = JSON.parse(event.data)
              
              // Handle WebSocket trade events
              if (Array.isArray(data) && data[0]?.ev === 'T') {
                const tickerData = data[0]
                const symbol = tickerData.sym
                const price = tickerData.p
                
                if (symbol && typeof price === 'number') {
                  // Find the item in watchlists to get previous price
                  const state = get()
                  const watchlist = state.watchlists.find(w => 
                    w.items.some(item => item.symbol === symbol)
                  )
                  const item = watchlist?.items.find(item => item.symbol === symbol)
                  
                  if (item) {
                    const previousPrice = item.price
                    const change = price - previousPrice
                    const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0
                    
                    get().updatePriceFromWebSocket(symbol, price, change, changePercent)
                  }
                }
              }
            } catch (error) {
              console.error('Error processing WebSocket message:', error)
            }
          })
          
          set({ isConnectedToRealTime: true })
          
          // Store cleanup function for later use
          get().stopRealTimeUpdates = () => {
            cleanup()
            set({ isConnectedToRealTime: false })
          }
          
        } catch (error) {
          console.error('Error starting real-time updates:', error)
          set({ isConnectedToRealTime: false })
        }
      },
      
      stopRealTimeUpdates: () => {
        try {
          const { polygonAPI } = require('@/lib/polygon-api')
          // The cleanup function is stored in startRealTimeUpdates
          set({ isConnectedToRealTime: false })
        } catch (error) {
          console.error('Error stopping real-time updates:', error)
          set({ isConnectedToRealTime: false })
        }
      },
      
      updatePriceFromWebSocket: (symbol: string, price: number, change: number, changePercent: number) => {
        set((state) => ({
          watchlists: state.watchlists.map(watchlist => ({
            ...watchlist,
            items: watchlist.items.map(item => 
              item.symbol === symbol 
                ? { 
                    ...item, 
                    price, 
                    change, 
                    changePercent, 
                    lastUpdated: new Date().toISOString() 
                  }
                : item
            )
          }))
        }))
      }
    }),
    {
      name: 'watchlist-store'
    }
  )
)

// Portfolio Store
interface PortfolioStore {
  portfolios: Portfolio[]
  activePortfolio: string | null
  addPortfolio: (portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => void
  removePortfolio: (id: string) => void
  addPosition: (portfolioId: string, position: Omit<Portfolio['positions'][0], 'id'>) => void
  removePosition: (portfolioId: string, positionId: string) => void
  updatePosition: (portfolioId: string, positionId: string, updates: Partial<Portfolio['positions'][0]>) => void
  setActivePortfolio: (id: string | null) => void
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      portfolios: [],
      activePortfolio: null,
      
      addPortfolio: (portfolio) => set((state) => ({
        portfolios: [
          ...state.portfolios,
          {
            ...portfolio,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      })),
      removePortfolio: (id) => set((state) => ({
        portfolios: state.portfolios.filter(p => p.id !== id),
        activePortfolio: state.activePortfolio === id ? null : state.activePortfolio,
      })),
      addPosition: (portfolioId, position) => set((state) => ({
        portfolios: state.portfolios.map(p => 
          p.id === portfolioId 
            ? {
                ...p,
                positions: [
                  ...p.positions,
                  {
                    ...position,
                    id: Math.random().toString(36).substr(2, 9),
                  }
                ],
                updatedAt: new Date(),
              }
            : p
        )
      })),
      removePosition: (portfolioId, positionId) => set((state) => ({
        portfolios: state.portfolios.map(p => 
          p.id === portfolioId 
            ? {
                ...p,
                positions: p.positions.filter(pos => pos.id !== positionId),
                updatedAt: new Date(),
              }
            : p
        )
      })),
      updatePosition: (portfolioId, positionId, updates) => set((state) => ({
        portfolios: state.portfolios.map(p => 
          p.id === portfolioId 
            ? {
                ...p,
                positions: p.positions.map(pos => 
                  pos.id === positionId ? { ...pos, ...updates } : pos
                ),
                updatedAt: new Date(),
              }
            : p
        )
      })),
      setActivePortfolio: (id) => set({ activePortfolio: id }),
    }),
    {
      name: 'portfolio-store',
    }
  )
)

// Chat Store
interface ChatStore {
  sessions: ChatSession[]
  activeSession: string | null
  addSession: (session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>) => void
  removeSession: (id: string) => void
  addMessage: (sessionId: string, message: Omit<ChatSession['messages'][0], 'id' | 'timestamp'>) => void
  setActiveSession: (id: string | null) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      sessions: [],
      activeSession: null,
      
      addSession: (session) => set((state) => ({
        sessions: [
          ...state.sessions,
          {
            ...session,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      })),
      removeSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id),
        activeSession: state.activeSession === id ? null : state.activeSession,
      })),
      addMessage: (sessionId, message) => set((state) => ({
        sessions: state.sessions.map(s => 
          s.id === sessionId 
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    ...message,
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: new Date(),
                  }
                ],
                updatedAt: new Date(),
              }
            : s
        )
      })),
      setActiveSession: (id) => set({ activeSession: id }),
    }),
    {
      name: 'chat-store',
    }
  )
)

// Market Data Store
interface MarketDataStore {
  stocks: Stock[]
  cryptos: Crypto[]
  forex: Forex[]
  commodities: Commodity[]
  realTimeData: Record<string, RealTimeData>
  setStocks: (stocks: Stock[]) => void
  setCryptos: (cryptos: Crypto[]) => void
  setForex: (forex: Forex[]) => void
  setCommodities: (commodities: Commodity[]) => void
  updateRealTimeData: (data: RealTimeData) => void
}

export const useMarketDataStore = create<MarketDataStore>()(
  persist(
    (set) => ({
      stocks: [] as Stock[],
      cryptos: [] as Crypto[],
      forex: [] as Forex[],
      commodities: [] as Commodity[],
      realTimeData: {} as Record<string, RealTimeData>,
      
      setStocks: (stocks: Stock[]) => set({ stocks }),
      setCryptos: (cryptos: Crypto[]) => set({ cryptos }),
      setForex: (forex: Forex[]) => set({ forex }),
      setCommodities: (commodities: Commodity[]) => set({ commodities }),
      updateRealTimeData: (data: RealTimeData) => set((state) => ({
        realTimeData: {
          ...state.realTimeData,
          [data.symbol]: data
        }
      }))
    }),
    {
      name: 'market-data-store'
    }
  )
)