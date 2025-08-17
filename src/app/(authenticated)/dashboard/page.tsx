'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  PieChart, 
  Eye, 
  Plus,
  Star,
  BarChart3,
  Target,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useAuthStore, useWatchlistStore, usePortfolioStore } from '@/store'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { watchlists, loadWatchlists, isLoading: watchlistsLoading } = useWatchlistStore()
  const { portfolios } = usePortfolioStore()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        await loadWatchlists()
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [loadWatchlists])

  // Calculate portfolio statistics
  const totalPortfolioValue = portfolios.reduce((total, portfolio) => {
    return total + portfolio.positions.reduce((posTotal, position) => {
      return posTotal + (position.marketValue || 0)
    }, 0)
  }, 0)

  const totalPositions = portfolios.reduce((total, portfolio) => {
    return total + portfolio.positions.length
  }, 0)

  // Calculate total watchlist items (not just watchlists)
  const totalWatchlistItems = watchlists.reduce((total, watchlist) => {
    // Only count items in watchlists that actually have items
    return total + (watchlist.items?.length || 0)
  }, 0)

  // Count only watchlists that have items or are user-created (not auto-created empty ones)
  const activeWatchlists = watchlists.filter(watchlist => {
    // Count watchlists that have items OR are not the default "My Watchlist" when empty
    return (watchlist.items?.length || 0) > 0 || watchlist.name !== 'My Watchlist'
  })

  // Check if user is new (no data)
  const isNewUser = totalPositions === 0 && totalWatchlistItems === 0 && totalPortfolioValue === 0

  // Additional check: If there are no watchlists at all, definitely show welcome
  const hasNoWatchlists = watchlists.length === 0
  const shouldShowWelcome = isNewUser || hasNoWatchlists

  // Debug logging - moved after all variables are defined
  console.log('🔍 Dashboard Debug - Watchlist Data:', {
    totalWatchlists: watchlists.length,
    totalWatchlistItems,
    activeWatchlists: activeWatchlists.length,
    watchlists: watchlists.map(w => ({
      id: w.id,
      name: w.name,
      itemCount: w.items?.length || 0,
      items: w.items?.map(item => item.symbol) || []
    })),
    isNewUser,
    totalPositions,
    totalPortfolioValue
  })

  // Additional debug: Check if any watchlist has items
  const watchlistsWithItems = watchlists.filter(w => (w.items?.length || 0) > 0)
  console.log('🔍 Watchlists with items:', watchlistsWithItems.map(w => ({
    name: w.name,
    items: w.items?.map(item => item.symbol) || []
  })))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.firstName || 'User'}! Here's your trading overview.
          </p>
        </div>
      </div>

      {/* New User Welcome Section */}
      {shouldShowWelcome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Vidality! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You're all set up! Start exploring the platform by creating your first watchlist, 
                trying paper trading, or exploring market data. We're here to help you succeed.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => router.push('/watchlist')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Watchlist
                </Button>
                <Button 
                  onClick={() => router.push('/paper-trading')}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Start Paper Trading
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Portfolio Value */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-green-700 dark:text-green-300">
              <span>Portfolio Value</span>
              <DollarSign className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(totalPortfolioValue)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {totalPositions} position{totalPositions !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Total Positions */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-blue-700 dark:text-blue-300">
              <span>Total Positions</span>
              <PieChart className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalPositions}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Across {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Watchlist Items */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-purple-700 dark:text-purple-300">
              <span>Watchlist Items</span>
              <Eye className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {totalWatchlistItems || 0}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Stocks tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for New Users */}
      {shouldShowWelcome && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>Get Started</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Create Your First Watchlist</p>
                    <p className="text-sm text-muted-foreground">Track stocks you're interested in</p>
                  </div>
                  <Button 
                    onClick={() => router.push('/watchlist')}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create</span>
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Start Paper Trading</p>
                    <p className="text-sm text-muted-foreground">Practice with virtual money</p>
                  </div>
                  <Button 
                    onClick={() => router.push('/paper-trading')}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Start</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span>Market Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Real-time Market Data
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Access comprehensive market data and analysis tools
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Professional Tools
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Access advanced charts and analysis tools
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
