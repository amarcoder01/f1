'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Zap,
  Globe,
  Activity,
  Brain,
  BarChart3,
  DollarSign,
  BrainCircuit,
  Target
} from 'lucide-react'
import PolygonBacktestComponent from '@/components/qlib/PolygonBacktestComponent'
import AIPredictionsComponent from '@/components/ai-predictions/AIPredictionsComponent'
import EnhancedPortfolioManager from '@/components/portfolio/EnhancedPortfolioManager'
import AdvancedStrategyBuilder from '@/components/trading/AdvancedStrategyBuilder'
import StockComparisonAnalyzer from '@/components/trading/StockComparisonAnalyzer'

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Professional Trading Tools
        </h1>
        <p className="text-muted-foreground">
          Advanced backtesting, AI predictions, and comprehensive portfolio management
        </p>
      </div>

      <Tabs defaultValue="backtesting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="backtesting" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Advanced Backtesting
          </TabsTrigger>
          <TabsTrigger value="ai-predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Predictions
            <Badge variant="secondary" className="ml-1">NEW</Badge>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Portfolio Manager
            <Badge variant="secondary" className="ml-1">ENHANCED</Badge>
          </TabsTrigger>
          <TabsTrigger value="strategy-builder" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            Strategy Builder
            <Badge variant="secondary" className="ml-1">AI POWERED</Badge>
          </TabsTrigger>
          <TabsTrigger value="stock-comparison" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Stock Comparison
            <Badge variant="secondary" className="ml-1">AI ANALYSIS</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backtesting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Advanced Backtesting
              </CardTitle>
              <CardDescription>
                Professional backtesting platform with comprehensive strategy testing, risk analysis, and performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-blue-800">Market Data</div>
                  <div className="text-sm text-blue-600">Comprehensive Coverage</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-green-800">Real-time</div>
                  <div className="text-sm text-green-600">Live Updates</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold text-purple-800">Advanced</div>
                  <div className="text-sm text-purple-600">Strategy Testing</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <PolygonBacktestComponent />
        </TabsContent>

        <TabsContent value="ai-predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI-Powered Predictions
                <Badge className="bg-purple-100 text-purple-800">ML Models</Badge>
              </CardTitle>
              <CardDescription>
                Advanced AI-powered market predictions using multiple machine learning models for accurate forecasting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold text-purple-800">Next-Day</div>
                  <div className="text-sm text-purple-600">Price Prediction</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-blue-800">Multi-Day</div>
                  <div className="text-sm text-blue-600">Forecasting</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-green-800">Ranking</div>
                  <div className="text-sm text-green-600">Top Stocks</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Globe className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-semibold text-orange-800">Market</div>
                  <div className="text-sm text-orange-600">Trend Analysis</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AIPredictionsComponent />
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Enhanced Portfolio Manager
                <Badge className="bg-green-100 text-green-800">PRO</Badge>
              </CardTitle>
              <CardDescription>
                Professional portfolio management with advanced analytics, risk assessment, and comprehensive trade tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-green-800">Trade Tracking</div>
                  <div className="text-sm text-green-600">Buy/Sell Records</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-blue-800">Analytics</div>
                  <div className="text-sm text-blue-600">Performance Metrics</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold text-purple-800">Risk Analysis</div>
                  <div className="text-sm text-purple-600">Portfolio Health</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-semibold text-orange-800">Real-time</div>
                  <div className="text-sm text-orange-600">Live Updates</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <EnhancedPortfolioManager />
        </TabsContent>

        <TabsContent value="strategy-builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-600" />
                AI-Powered Strategy Builder
                <Badge className="bg-purple-100 text-purple-800">ADVANCED</Badge>
              </CardTitle>
              <CardDescription>
                Create, test, and optimize advanced trading strategies using AI and machine learning for maximum accuracy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold text-purple-800">AI Strategy</div>
                  <div className="text-sm text-purple-600">Machine Learning</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-blue-800">Backtesting</div>
                  <div className="text-sm text-blue-600">Historical Data</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-green-800">Optimization</div>
                  <div className="text-sm text-green-600">Auto Tuning</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-semibold text-orange-800">Live Trading</div>
                  <div className="text-sm text-orange-600">Real-time</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AdvancedStrategyBuilder />
        </TabsContent>

        <TabsContent value="stock-comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Stock Comparison & AI Analysis
                <Badge className="bg-blue-100 text-blue-800">AI POWERED</Badge>
              </CardTitle>
              <CardDescription>
                Compare multiple stocks with comprehensive AI-powered analysis, competitive insights, and investment recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-blue-800">Multi-Stock</div>
                  <div className="text-sm text-blue-600">Comparison</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold text-purple-800">AI Analysis</div>
                  <div className="text-sm text-purple-600">Comprehensive</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-green-800">Competitive</div>
                  <div className="text-sm text-green-600">Insights</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-semibold text-orange-800">Investment</div>
                  <div className="text-sm text-orange-600">Recommendations</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <StockComparisonAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
