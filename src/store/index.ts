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
  Commodity,
  PriceAlert,
  CreatePriceAlertRequest,
  PriceAlertHistory,
  User,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse
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
  isHydrated: boolean
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
  setHydrated: (hydrated: boolean) => void
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      watchlists: [] as Watchlist[],
      activeWatchlist: null,
      isLoading: false,
      isConnectedToRealTime: false,
      isHydrated: false,
      
      loadWatchlists: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/watchlist')
          console.log('📡 Watchlist API response status:', response.status)
          
          if (response.ok) {
            const responseData = await response.json()
            console.log('📊 Watchlist API response data:', responseData)
            
            if (responseData.success && responseData.data) {
              set({ watchlists: responseData.data, isLoading: false })
              console.log('✅ Successfully loaded watchlists:', responseData.data)
            } else {
              console.error('❌ Invalid response format:', responseData)
              set({ isLoading: false })
            }
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.error('❌ Failed to load watchlists:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            })
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('❌ Error loading watchlists:', error)
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
          console.log(`🔍 Store: Adding ${item.symbol} to watchlist ${watchlistId}...`)
          console.log(`📊 Item data:`, item)
          
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
          
          console.log(`📡 API Response status:`, response.status)
          
          if (response.ok) {
            const { data } = await response.json()
            console.log(`✅ API Response data:`, data)
            
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
            
            console.log(`✅ Successfully added ${item.symbol} to watchlist in store`)
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.error('❌ Failed to add item to watchlist:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            })
            
            // Throw error with details for better error handling
            const errorMessage = errorData.message || errorData.error || response.statusText || 'Unknown error'
            console.error('❌ API Error details:', {
              status: response.status,
              message: errorMessage,
              fullError: errorData
            })
            throw new Error(`API Error ${response.status}: ${errorMessage}`)
          }
        } catch (error) {
          console.error('❌ Error adding item to watchlist:', error)
          set({ isLoading: false })
          // Re-throw the error so the component can handle it
          throw error
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
          const { multiSourceAPI } = require('@/lib/multi-source-api')
          
          // Set up periodic updates using multi-source system
          const allSymbols = get().watchlists.flatMap(w => w.items.map(item => item.symbol))
          
          if (allSymbols.length > 0) {
            // Start periodic updates every 30 seconds
            const updateInterval = setInterval(async () => {
              try {
                for (const symbol of allSymbols) {
                  const freshData = await multiSourceAPI.getStockData(symbol)
                  if (freshData && freshData.price > 0) {
                    get().updatePriceFromWebSocket(symbol, freshData.price, freshData.change, freshData.changePercent)
                  }
                }
              } catch (error) {
                console.error('Error in periodic update:', error)
              }
            }, 30000)
            
            set({ isConnectedToRealTime: true })
            
            // Store cleanup function for later use
            get().stopRealTimeUpdates = () => {
              clearInterval(updateInterval)
              set({ isConnectedToRealTime: false })
            }
          } else {
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
      },
      
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated })
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

// News Store
interface NewsStore {
  news: any[]
  marketUpdates: any[]
  unreadCount: number
  isLoading: boolean
  lastFetch: Date | null
  fetchNews: () => Promise<void>
  markAsRead: () => void
  incrementUnreadCount: () => void
}

export const useNewsStore = create<NewsStore>()(
  persist(
    (set, get) => ({
      news: [],
      marketUpdates: [],
      unreadCount: 0,
      isLoading: false,
      lastFetch: null,
      
      fetchNews: async () => {
        set({ isLoading: true })
        try {
          const [newsResponse, updatesResponse] = await Promise.all([
            fetch('/api/news?limit=15'),
            fetch('/api/news?type=market-updates&limit=5')
          ])
          
          const newsData = await newsResponse.json()
          const updatesData = await updatesResponse.json()
          
          if (newsData.success && updatesData.success) {
            set({ 
              news: newsData.data, 
              marketUpdates: updatesData.data,
              lastFetch: new Date(),
              unreadCount: Math.min(get().unreadCount + 5, 99) // Increment unread count for real news
            })
            console.log(`✅ News store updated: ${newsData.data.length} articles, ${updatesData.data.length} updates`)
          } else {
            console.warn('⚠️ News API returned partial data:', { newsData, updatesData })
            // Still update with available data
            if (newsData.success) {
              set({ 
                news: newsData.data, 
                lastFetch: new Date(),
                unreadCount: Math.min(get().unreadCount + 3, 99)
              })
            }
            if (updatesData.success) {
              set({ 
                marketUpdates: updatesData.data,
                lastFetch: new Date()
              })
            }
          }
        } catch (error) {
          console.error('❌ Error fetching news:', error)
          // Don't throw error, just log it and keep existing data
        } finally {
          set({ isLoading: false })
        }
      },
      
      markAsRead: () => set({ unreadCount: 0 }),
      
      incrementUnreadCount: () => set((state) => ({ 
        unreadCount: Math.min(state.unreadCount + 1, 99) 
      }))
    }),
    {
      name: 'news-store'
    }
  )
)

// Price Alert Store
interface PriceAlertStore {
  alerts: PriceAlert[]
  currentPrices: Record<string, {
    currentPrice: number | null
    priceChange: number | null
    priceChangePercent: number | null
    name: string | null
    lastUpdated: string | null
  }>
  schedulerStatus: {
    isActive: boolean
    intervalSeconds: number
    nextCheckTime: string | null
  }
  isLoading: boolean
  error: string | null
  createAlert: (alert: CreatePriceAlertRequest) => Promise<void>
  updateAlert: (id: string, updates: Partial<PriceAlert>) => Promise<void>
  deleteAlert: (id: string) => Promise<void>
  cancelAlert: (id: string) => Promise<void>
  loadAlerts: () => Promise<void>
  loadCurrentPrices: () => Promise<void>
  loadSchedulerStatus: () => Promise<void>
  startScheduler: () => Promise<void>
  stopScheduler: () => Promise<void>
  refreshAlerts: () => Promise<void>
  getActiveAlerts: () => PriceAlert[]
  getAlertHistory: (alertId: string) => Promise<PriceAlertHistory[]>
}

export const usePriceAlertStore = create<PriceAlertStore>()(
  persist(
    (set, get) => ({
      alerts: [],
      currentPrices: {},
      schedulerStatus: {
        isActive: false,
        intervalSeconds: 60,
        nextCheckTime: null
      },
      isLoading: false,
      error: null,
      
      createAlert: async (alertData: CreatePriceAlertRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/price-alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
          })
          
          if (response.ok) {
            const { data } = await response.json()
            set((state) => ({
              alerts: [...state.alerts, data],
              isLoading: false
            }))
          } else {
            const errorData = await response.json()
            set({ 
              error: errorData.message || 'Failed to create alert',
              isLoading: false 
            })
            throw new Error(errorData.message || 'Failed to create alert')
          }
        } catch (error) {
          console.error('Error creating price alert:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create alert',
            isLoading: false 
          })
          throw error
        }
      },
      
      updateAlert: async (id: string, updates: Partial<PriceAlert>) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/price-alerts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          })
          
          if (response.ok) {
            const { data } = await response.json()
            set((state) => ({
              alerts: state.alerts.map(alert => 
                alert.id === id ? { ...alert, ...data } : alert
              ),
              isLoading: false
            }))
          } else {
            const errorData = await response.json()
            set({ 
              error: errorData.message || 'Failed to update alert',
              isLoading: false 
            })
            throw new Error(errorData.message || 'Failed to update alert')
          }
        } catch (error) {
          console.error('Error updating price alert:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update alert',
            isLoading: false 
          })
          throw error
        }
      },
      
      deleteAlert: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/price-alerts/${id}`, {
            method: 'DELETE'
          })
          
          if (response.ok) {
            set((state) => ({
              alerts: state.alerts.filter(alert => alert.id !== id),
              isLoading: false
            }))
          } else {
            const errorData = await response.json()
            set({ 
              error: errorData.message || 'Failed to delete alert',
              isLoading: false 
            })
            throw new Error(errorData.message || 'Failed to delete alert')
          }
        } catch (error) {
          console.error('Error deleting price alert:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete alert',
            isLoading: false 
          })
          throw error
        }
      },
      
      cancelAlert: async (id: string) => {
        await get().updateAlert(id, { status: 'cancelled', isActive: false })
      },
      
      loadAlerts: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/price-alerts')
          
          if (response.ok) {
            const { data } = await response.json()
            set({ alerts: data, isLoading: false })
            // Load current prices after loading alerts
            await get().loadCurrentPrices()
          } else {
            const errorData = await response.json()
            set({ 
              error: errorData.message || 'Failed to load alerts',
              isLoading: false 
            })
          }
        } catch (error) {
          console.error('Error loading price alerts:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load alerts',
            isLoading: false 
          })
        }
      },

      loadCurrentPrices: async () => {
        try {
          const response = await fetch('/api/price-alerts/prices')
          
          if (response.ok) {
            const { data } = await response.json()
            const pricesMap: Record<string, any> = {}
            data.forEach((item: any) => {
              pricesMap[item.symbol] = {
                currentPrice: item.currentPrice,
                priceChange: item.priceChange,
                priceChangePercent: item.priceChangePercent,
                name: item.name,
                lastUpdated: item.lastUpdated
              }
            })
            set({ currentPrices: pricesMap })
          }
        } catch (error) {
          console.error('Failed to load current prices:', error)
        }
      },

      loadSchedulerStatus: async () => {
        try {
          const response = await fetch('/api/price-alerts/scheduler')
          
          if (response.ok) {
            const { data } = await response.json()
            set({ schedulerStatus: data })
          }
        } catch (error) {
          console.error('Failed to load scheduler status:', error)
        }
      },

      startScheduler: async () => {
        try {
          const response = await fetch('/api/price-alerts/scheduler', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'start' })
          })
          
          if (response.ok) {
            const { data } = await response.json()
            set({ schedulerStatus: data })
          } else {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to start scheduler')
          }
        } catch (error) {
          console.error('Error starting scheduler:', error)
          throw error
        }
      },

      stopScheduler: async () => {
        try {
          const response = await fetch('/api/price-alerts/scheduler', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'stop' })
          })
          
          if (response.ok) {
            const { data } = await response.json()
            set({ schedulerStatus: data })
          } else {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to stop scheduler')
          }
        } catch (error) {
          console.error('Error stopping scheduler:', error)
          throw error
        }
      },
      
      refreshAlerts: async () => {
        await get().loadAlerts()
      },
      
      getActiveAlerts: () => {
        return get().alerts.filter(alert => alert.status === 'active' && alert.isActive)
      },
      
      getAlertHistory: async (alertId: string) => {
        try {
          const response = await fetch(`/api/price-alerts/${alertId}/history`)
          
          if (response.ok) {
            const { data } = await response.json()
            return data
          } else {
            console.error('Failed to load alert history')
            return []
          }
        } catch (error) {
          console.error('Error loading alert history:', error)
          return []
        }
      }
    }),
    {
      name: 'price-alert-store'
    }
  )
)

// Authentication Store
interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  clearError: () => void
  updateUser: (updates: Partial<User>) => void
  refreshToken: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          })
          
          if (response.ok) {
            const data: AuthResponse = await response.json()
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          } else {
            const errorData = await response.json()
            set({
              error: errorData.message || 'Login failed',
              isLoading: false
            })
            throw new Error(errorData.message || 'Login failed')
          }
        } catch (error) {
          console.error('Login error:', error)
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          })
          throw error
        }
      },
      
      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          })
          
          if (response.ok) {
            const data: AuthResponse = await response.json()
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          } else {
            const errorData = await response.json()
            set({
              error: errorData.message || 'Registration failed',
              isLoading: false
            })
            throw new Error(errorData.message || 'Registration failed')
          }
        } catch (error) {
          console.error('Registration error:', error)
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false
          })
          throw error
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },
      
      clearError: () => set({ error: null }),
      
      updateUser: (updates: Partial<User>) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      refreshToken: async () => {
        const { token } = get()
        if (!token) return
        
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data: AuthResponse = await response.json()
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true
            })
          } else {
            // Token is invalid, logout user
            get().logout()
          }
        } catch (error) {
          console.error('Token refresh error:', error)
          get().logout()
        }
      },
      
      checkAuth: async () => {
        const { token } = get()
        if (!token) return
        
        try {
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (response.ok) {
            const data = await response.json()
            set({
              user: data.user,
              isAuthenticated: true
            })
          } else {
            get().logout()
          }
        } catch (error) {
          console.error('Auth check error:', error)
          get().logout()
        }
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)