'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Plus,
  Settings,
  RefreshCw,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Shield,
  Activity,
  PieChart,
  LineChart,
  Calendar,
  Users,
  Star,
  Bell,
  Filter,
  Search,
  Download,
  Share2,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Info,
  Play,
  Pause,
  Square,
  RotateCcw,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaperTradingAccount, PaperPosition, PaperOrder, PaperTransaction, Stock } from '@/types'
import { TradingOrderForm } from '@/components/trading/TradingOrderForm'
import { TradingAnalysis } from '@/components/trading/TradingAnalysis'
import { EnhancedStockSearch } from '@/components/EnhancedStockSearch'

export default function PaperTradingPage() {
  // State
  const [accounts, setAccounts] = useState<PaperTradingAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<PaperTradingAccount | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'orders' | 'history' | 'analysis'>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [newAccountName, setNewAccountName] = useState('')
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [realTimeData, setRealTimeData] = useState<Map<string, Stock>>(new Map())
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<PaperTradingAccount | null>(null)
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts()
  }, [])

  // Real-time data updates
  useEffect(() => {
    if (selectedAccount) {
      updateRealTimeData()
      const interval = setInterval(updateRealTimeData, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [selectedAccount])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/paper-trading/accounts')
      const data = await response.json()
      
      if (data.success) {
        setAccounts(data.data)
        if (data.data.length > 0 && !selectedAccount) {
          setSelectedAccount(data.data[0])
        }
      } else {
        setError(data.error || 'Failed to fetch accounts')
      }
    } catch (error) {
      setError('Failed to fetch accounts')
    } finally {
      setLoading(false)
    }
  }

  const updateRealTimeData = async () => {
    if (!selectedAccount) return

    try {
      console.log(`🔄 Updating real-time data for ${selectedAccount.positions.length} positions...`)
      // Update real-time data for all positions
      const newRealTimeData = new Map(realTimeData)
      
      for (const position of selectedAccount.positions) {
        try {
          const stockData = await fetchStockData(position.symbol)
          if (stockData) {
            newRealTimeData.set(position.symbol, stockData)
            console.log(`✅ Updated real-time data for ${position.symbol}: $${stockData.price}`)
          } else {
            console.log(`⚠️ No real-time data available for ${position.symbol}`)
          }
        } catch (error) {
          console.error(`❌ Error updating real-time data for ${position.symbol}:`, error)
        }
      }
      
      setRealTimeData(newRealTimeData)
      console.log(`✅ Real-time data update completed`)
    } catch (error) {
      console.error('❌ Error updating real-time data:', error)
    }
  }

  const fetchStockData = async (symbol: string): Promise<Stock | null> => {
    try {
      console.log(`🔍 Fetching stock data for ${symbol}...`)
      const response = await fetch(`/api/stocks/quote?symbol=${encodeURIComponent(symbol)}`)
      
      if (!response.ok) {
        console.error(`❌ Failed to fetch stock data for ${symbol}:`, response.status)
        return null
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        console.log(`✅ Stock data fetched for ${symbol}: $${data.data.price}`)
        return data.data
      } else {
        console.error(`❌ No stock data for ${symbol}:`, data.error)
        return null
      }
    } catch (error) {
      console.error(`❌ Error fetching stock data for ${symbol}:`, error)
      return null
    }
  }



  const createAccount = async () => {
    if (!newAccountName.trim()) return

    try {
      const response = await fetch('/api/paper-trading/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAccountName, initialBalance: 100000 }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAccounts([...accounts, data.data])
        setSelectedAccount(data.data)
        setShowCreateAccount(false)
        setNewAccountName('')
      } else {
        setError(data.error || 'Failed to create account')
      }
    } catch (error) {
      setError('Failed to create account')
    }
  }

  const handleNewOrder = (symbol?: string) => {
    if (symbol) {
      setSelectedSymbol(symbol)
    }
    setShowOrderForm(true)
  }

  const handleOrderPlaced = async () => {
    setShowOrderForm(false)
    setSelectedSymbol('')
    
    // Refresh accounts to get updated data
    try {
      console.log('🔄 Refreshing accounts after order placement...')
      const response = await fetch('/api/paper-trading/accounts')
      const data = await response.json()
      
      if (data.success) {
        setAccounts(data.data)
        
        // Update the selected account with fresh data
        if (selectedAccount) {
          const updatedAccount = data.data.find((account: PaperTradingAccount) => account.id === selectedAccount.id)
          if (updatedAccount) {
            console.log('✅ Updated selected account with fresh data')
            setSelectedAccount(updatedAccount)
            
            // Also update real-time data for the new positions
            if (updatedAccount.positions.length > 0) {
              await updateRealTimeData()
            }
          }
        }
      } else {
        console.error('❌ Failed to refresh accounts:', data.error)
      }
    } catch (error) {
      console.error('❌ Error refreshing accounts:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return

    try {
      setDeletingAccount(true)
      console.log(`🗑️ Deleting account: ${accountToDelete.name}`)
      
      const response = await fetch(`/api/paper-trading/accounts/${accountToDelete.id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Account deleted successfully')
        
        // Remove the account from the list
        const updatedAccounts = accounts.filter(account => account.id !== accountToDelete.id)
        setAccounts(updatedAccounts)
        
        // If the deleted account was selected, select the first available account or clear selection
        if (selectedAccount?.id === accountToDelete.id) {
          if (updatedAccounts.length > 0) {
            setSelectedAccount(updatedAccounts[0])
          } else {
            setSelectedAccount(null)
          }
        }
        
        // Close the confirmation modal
        setShowDeleteConfirm(false)
        setAccountToDelete(null)
      } else {
        console.error('❌ Failed to delete account:', data.error)
        setError(data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('❌ Error deleting account:', error)
      setError('Failed to delete account')
    } finally {
      setDeletingAccount(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getRealTimePrice = (symbol: string) => {
    return realTimeData.get(symbol)?.price || 0
  }

  const getRealTimeChange = (symbol: string) => {
    const stock = realTimeData.get(symbol)
    return stock ? stock.changePercent : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchAccounts}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paper Trading</h1>
          <p className="text-muted-foreground">Practice trading with virtual money</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowCreateAccount(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Account
          </Button>
          <Button onClick={fetchAccounts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Global Stock Search */}
      <div className="mb-6">
        <div className="max-w-2xl">
          <label className="text-sm font-medium mb-2 block">Quick Stock Search</label>
          <EnhancedStockSearch
            onStockSelect={(stock) => {
              setSelectedSymbol(stock.symbol)
              setSearchQuery(stock.symbol)
              setShowOrderForm(true)
            }}
            placeholder="Search for any stock to place an order..."
            className="w-full"
            showFilters={true}
            maxResults={10}
          />
        </div>
      </div>

      {/* Account Selection */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Select Account</span>
              {selectedAccount && (
                <Badge variant={selectedAccount.totalPnL >= 0 ? 'default' : 'destructive'}>
                  {formatPercentage(selectedAccount.totalPnLPercent)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <Card
                  key={account.id}
                  className={`cursor-pointer transition-all ${
                    selectedAccount?.id === account.id
                      ? 'ring-2 ring-primary'
                      : 'hover:shadow-md'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 
                        className="font-semibold cursor-pointer flex-1"
                        onClick={() => setSelectedAccount(account)}
                      >
                        {account.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setAccountToDelete(account)
                            setShowDeleteConfirm(true)
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div 
                      className="space-y-1 cursor-pointer"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Value:</span>
                        <span className="font-medium">{formatCurrency(account.totalValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Available Cash:</span>
                        <span className="font-medium">{formatCurrency(account.availableCash)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">P&L:</span>
                        <span className={`font-medium ${account.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(account.totalPnL)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {selectedAccount && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Account Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Account Overview</span>
                  <Settings className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Initial Balance:</span>
                    <span className="font-medium">{formatCurrency(selectedAccount.initialBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Balance:</span>
                    <span className="font-medium">{formatCurrency(selectedAccount.currentBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Available Cash:</span>
                    <span className="font-medium">{formatCurrency(selectedAccount.availableCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Value:</span>
                    <span className="font-medium">{formatCurrency(selectedAccount.totalValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total P&L:</span>
                    <span className={`font-medium ${selectedAccount.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedAccount.totalPnL)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">P&L %:</span>
                    <span className={`font-medium ${selectedAccount.totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(selectedAccount.totalPnLPercent)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleNewOrder()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setActiveTab('analysis')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analysis
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex space-x-1">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'positions', label: 'Positions', icon: BarChart3 },
                    { id: 'orders', label: 'Orders', icon: Clock },
                    { id: 'history', label: 'History', icon: Calendar },
                    { id: 'analysis', label: 'Analysis', icon: TrendingUp },
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'default' : 'ghost'}
                        onClick={() => setActiveTab(tab.id as any)}
                        className="flex items-center space-x-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedAccount.positions.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Active positions in portfolio
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${selectedAccount.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedAccount.totalPnL)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(selectedAccount.totalPnLPercent)} from initial balance
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(selectedAccount.availableCash)}</div>
                    <p className="text-xs text-muted-foreground">
                      Ready for new trades
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'positions' && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAccount.positions.length === 0 ? (
                    <div className="text-center py-8">
                      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Positions</h3>
                      <p className="text-muted-foreground mb-4">
                        You don't have any open positions yet.
                      </p>
                      <Button onClick={() => handleNewOrder()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Place Your First Trade
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedAccount.positions.map((position) => {
                        const realTimePrice = getRealTimePrice(position.symbol)
                        const realTimeChange = getRealTimeChange(position.symbol)
                        const currentValue = realTimePrice * position.quantity
                        const unrealizedPnL = currentValue - (position.averagePrice * position.quantity)
                        const unrealizedPnLPercent = ((realTimePrice - position.averagePrice) / position.averagePrice) * 100

                        return (
                          <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="font-semibold">{position.symbol}</h4>
                                <p className="text-sm text-muted-foreground">{position.name}</p>
                                {realTimePrice > 0 && (
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm font-medium">{formatCurrency(realTimePrice)}</span>
                                    <span className={`text-xs ${realTimeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatPercentage(realTimeChange)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{position.quantity} shares</div>
                              <div className="text-sm text-muted-foreground">
                                Avg: {formatCurrency(position.averagePrice)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(currentValue)}</div>
                              <div className={`text-sm ${unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(unrealizedPnL)} ({formatPercentage(unrealizedPnLPercent)})
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'orders' && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAccount.orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Orders</h3>
                      <p className="text-muted-foreground">
                        You haven't placed any orders yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedAccount.orders.slice(0, 10).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-semibold">{order.symbol}</h4>
                              <p className="text-sm text-muted-foreground">
                                {order.type.toUpperCase()} {order.side.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{order.quantity} shares</div>
                            {order.price && (
                              <div className="text-sm text-muted-foreground">
                                @ {formatCurrency(order.price)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              order.status === 'filled' ? 'default' :
                              order.status === 'pending' ? 'secondary' :
                              order.status === 'cancelled' ? 'destructive' : 'outline'
                            }>
                              {order.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'history' && (
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAccount.transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
                      <p className="text-muted-foreground">
                        No transactions have been recorded yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedAccount.transactions.slice(0, 20).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-semibold">{transaction.symbol}</h4>
                              <p className="text-sm text-muted-foreground">
                                {transaction.type.toUpperCase()} - {transaction.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(transaction.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'analysis' && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <TradingAnalysis 
                    account={selectedAccount} 
                    realTimeData={realTimeData}
                    onRefresh={updateRealTimeData}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Paper Trading Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Account Name</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="Enter account name"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateAccount(false)}>
                  Cancel
                </Button>
                <Button onClick={createAccount} disabled={!newAccountName.trim()}>
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Place New Order</span>
                  <Button variant="outline" size="sm" onClick={() => setShowOrderForm(false)}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedSymbol && (
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Search for a stock</label>
                    <EnhancedStockSearch
                      onStockSelect={(stock) => {
                        setSelectedSymbol(stock.symbol)
                        setSearchQuery(stock.symbol)
                      }}
                      placeholder="Search stocks, ETFs, or companies..."
                      className="w-full"
                      showFilters={true}
                      maxResults={8}
                    />
                  </div>
                )}
                
                {selectedSymbol && (
                  <TradingOrderForm
                    symbol={selectedSymbol}
                    accountId={selectedAccount?.id}
                    onOrderPlaced={handleOrderPlaced}
                    onCancel={() => setShowOrderForm(false)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && accountToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Deletion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete account "{accountToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount}>
                  {deletingAccount ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
