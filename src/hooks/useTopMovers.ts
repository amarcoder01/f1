import { useState, useEffect, useCallback, useRef } from 'react'
import { StockData, MarketStatus, AppState } from '@/types/top-movers'
import { TopMoversApiService } from '@/lib/top-movers-api'

const ITEMS_PER_PAGE = 20
const AUTO_REFRESH_INTERVAL = 15 * 60 * 1000 // 15 minutes in milliseconds

export const useTopMovers = () => {
  const [state, setState] = useState<AppState>({
    gainers: [],
    losers: [],
    loading: true,
    error: null,
    marketStatus: null,
    gainersPage: 1,
    losersPage: 1,
  })

  const [allGainers, setAllGainers] = useState<StockData[]>([])
  const [allLosers, setAllLosers] = useState<StockData[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchMarketStatus = useCallback(async () => {
    try {
      const marketStatus = await TopMoversApiService.getMarketStatus()
      setState(prev => ({ ...prev, marketStatus }))
    } catch (error) {
      console.error('Failed to fetch market status:', error)
      // Don't set error state for market status failure
    }
  }, [])

  const fetchInitialData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const [gainersResponse, losersResponse] = await Promise.all([
        TopMoversApiService.getTopGainers(),
        TopMoversApiService.getTopLosers(),
      ])

      const gainersData = gainersResponse.results || []
      const losersData = losersResponse.results || []

      setAllGainers(gainersData)
      setAllLosers(losersData)

      setState(prev => ({
        ...prev,
        gainers: gainersData.slice(0, ITEMS_PER_PAGE),
        losers: losersData.slice(0, ITEMS_PER_PAGE),
        loading: false,
        gainersPage: 1,
        losersPage: 1,
      }))

      // Update timestamps
      const now = new Date()
      setLastUpdated(now)
      setNextRefresh(new Date(now.getTime() + AUTO_REFRESH_INTERVAL))

      // If both gainers and losers are empty, set an error
      if (gainersData.length === 0 && losersData.length === 0) {
        setState(prev => ({
          ...prev,
          error: 'No top movers data available. This could be due to market hours, API limits, or temporary data unavailability. Please try again later.',
        }))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stock data'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
    }
  }, [])

  const loadMoreGainers = useCallback(() => {
    const nextPage = state.gainersPage + 1
    const startIndex = nextPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const newGainers = allGainers.slice(0, endIndex)

    setState(prev => ({
      ...prev,
      gainers: newGainers,
      gainersPage: nextPage,
    }))
  }, [state.gainersPage, allGainers])

  const loadMoreLosers = useCallback(() => {
    const nextPage = state.losersPage + 1
    const startIndex = nextPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const newLosers = allLosers.slice(0, endIndex)

    setState(prev => ({
      ...prev,
      losers: newLosers,
      losersPage: nextPage,
    }))
  }, [state.losersPage, allLosers])

  const hasMoreGainers = state.gainers.length < allGainers.length
  const hasMoreLosers = state.losers.length < allLosers.length

  const refreshData = useCallback(() => {
    fetchInitialData()
    fetchMarketStatus()
  }, [fetchInitialData, fetchMarketStatus])

  // Setup automatic refresh
  useEffect(() => {
    // Initial data fetch
    fetchInitialData()
    fetchMarketStatus()

    // Setup interval for automatic refresh
    intervalRef.current = setInterval(() => {
      fetchInitialData()
      fetchMarketStatus()
    }, AUTO_REFRESH_INTERVAL)

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchInitialData, fetchMarketStatus])

  return {
    ...state,
    loadMoreGainers,
    loadMoreLosers,
    hasMoreGainers,
    hasMoreLosers,
    refreshData,
    lastUpdated,
    nextRefresh,
  }
}
