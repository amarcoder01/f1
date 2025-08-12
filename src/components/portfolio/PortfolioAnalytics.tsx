'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react'

interface PortfolioPosition {
  id: string
  symbol: string
  name: string
  quantity: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  entryDate: string
  notes?: string
}

interface PortfolioAnalyticsProps {
  positions: PortfolioPosition[]
}

export default function PortfolioAnalytics({ positions }: PortfolioAnalyticsProps) {
  // Calculate portfolio statistics
  const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0)
  const totalCost = positions.reduce((sum, pos) => sum + (pos.quantity * pos.averagePrice), 0)
  const totalPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0)
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

  // Calculate sector allocation (mock data for now)
  const sectorAllocation = positions.reduce((acc, position) => {
    const sector = position.notes?.includes('tech') ? 'Technology' : 
                   position.notes?.includes('finance') ? 'Finance' : 
                   position.notes?.includes('health') ? 'Healthcare' : 'Other'
    
    acc[sector] = (acc[sector] || 0) + position.marketValue
    return acc
  }, {} as Record<string, number>)

  // Calculate risk metrics
  const winningPositions = positions.filter(pos => pos.unrealizedPnL > 0)
  const losingPositions = positions.filter(pos => pos.unrealizedPnL < 0)
  const winRate = positions.length > 0 ? (winningPositions.length / positions.length) * 100 : 0

  // Calculate diversification score
  const diversificationScore = positions.length > 0 ? 
    Math.min(positions.length * 10, 100) : 0

  // Calculate largest position percentage
  const largestPosition = positions.reduce((max, pos) => 
    pos.marketValue > max ? pos.marketValue : max, 0)
  const largestPositionPercent = totalValue > 0 ? (largestPosition / totalValue) * 100 : 0

  // Risk assessment
  const getRiskLevel = () => {
    if (largestPositionPercent > 50) return 'High'
    if (largestPositionPercent > 30) return 'Medium'
    return 'Low'
  }

  const riskLevel = getRiskLevel()

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Key performance metrics and risk indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-800">
                {winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-600">Win Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                {winningPositions.length}/{positions.length} positions
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">
                {diversificationScore}
              </div>
              <div className="text-sm text-green-600">Diversification</div>
              <div className="text-xs text-gray-500 mt-1">
                {positions.length} positions
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-800">
                {largestPositionPercent.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-600">Largest Position</div>
              <div className="text-xs text-gray-500 mt-1">
                ${largestPosition.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className={`text-2xl font-bold ${riskLevel === 'Low' ? 'text-green-800' : riskLevel === 'Medium' ? 'text-yellow-800' : 'text-red-800'}`}>
                {riskLevel}
              </div>
              <div className="text-sm text-orange-600">Risk Level</div>
              <div className="text-xs text-gray-500 mt-1">
                Based on concentration
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sector Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-green-600" />
            Sector Allocation
          </CardTitle>
          <CardDescription>
            Distribution of your portfolio across different sectors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(sectorAllocation).length === 0 ? (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sector data available. Add positions with sector notes to see allocation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(sectorAllocation)
                .sort(([,a], [,b]) => b - a)
                .map(([sector, value]) => {
                  const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0
                  return (
                    <div key={sector} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="font-medium">{sector}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${value.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Top Performers
          </CardTitle>
          <CardDescription>
            Your best performing positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {winningPositions.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No winning positions yet. Keep investing!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {winningPositions
                .sort((a, b) => b.unrealizedPnLPercent - a.unrealizedPnLPercent)
                .slice(0, 5)
                .map((position) => (
                <div key={position.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-semibold">{position.symbol}</div>
                      <div className="text-sm text-gray-600">{position.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      +{position.unrealizedPnLPercent.toFixed(2)}%
                    </div>
                    <div className="text-sm text-green-600">
                      +${position.unrealizedPnL.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Risk Alerts
          </CardTitle>
          <CardDescription>
            Important risk indicators for your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {largestPositionPercent > 30 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-semibold text-orange-800">High Concentration</div>
                  <div className="text-sm text-orange-600">
                    Your largest position represents {largestPositionPercent.toFixed(1)}% of your portfolio
                  </div>
                </div>
              </div>
            )}
            
            {positions.length < 3 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Target className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-semibold text-yellow-800">Low Diversification</div>
                  <div className="text-sm text-yellow-600">
                    Consider adding more positions to diversify your portfolio
                  </div>
                </div>
              </div>
            )}

            {losingPositions.length > winningPositions.length && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-semibold text-red-800">More Losing Positions</div>
                  <div className="text-sm text-red-600">
                    {losingPositions.length} losing vs {winningPositions.length} winning positions
                  </div>
                </div>
              </div>
            )}

            {positions.length > 0 && !(largestPositionPercent > 30 || positions.length < 3 || losingPositions.length > winningPositions.length) && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">Portfolio Looks Good</div>
                  <div className="text-sm text-green-600">
                    No major risk concerns detected
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Total Positions</div>
              <div className="text-2xl font-bold">{positions.length}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Total Value</div>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Total P&L</div>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
              </div>
              <div className={`text-sm ${totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
