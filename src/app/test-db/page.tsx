'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export default function TestDBPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testDatabaseConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/db/test')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test database connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testWatchlistOperations = async () => {
    setIsLoading(true)
    try {
      // Test creating a watchlist
      const createResponse = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Watchlist' })
      })
      
      if (!createResponse.ok) {
        throw new Error('Failed to create watchlist')
      }
      
      const { data: watchlist } = await createResponse.json()
      
      // Test adding a stock to the watchlist
      const addResponse = await fetch(`/api/watchlist/${watchlist.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'AAPL',
          name: 'Apple Inc.',
          type: 'stock',
          price: 185.50,
          change: 4.25,
          changePercent: 2.34,
        })
      })
      
      if (!addResponse.ok) {
        throw new Error('Failed to add stock to watchlist')
      }
      
      const { data: item } = await addResponse.json()
      
      setTestResult({
        success: true,
        message: 'Watchlist operations successful',
        data: {
          watchlist: {
            id: watchlist.id,
            name: watchlist.name,
            itemCount: watchlist.items.length
          },
          item: {
            id: item.id,
            symbol: item.symbol,
            name: item.name
          }
        }
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Watchlist operations failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Database Integration Test</h1>
        <p className="text-muted-foreground">
          Test the Azure PostgreSQL database connection and operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test the basic database connection and user creation
            </p>
            <Button 
              onClick={testDatabaseConnection}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Watchlist Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test creating watchlists and adding stocks
            </p>
            <Button 
              onClick={testWatchlistOperations}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Watchlist Ops'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Result
              <Badge variant={testResult.success ? 'success' : 'destructive'}>
                {testResult.success ? 'Success' : 'Failed'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Message:</h4>
              <p className="text-sm">{testResult.message}</p>
            </div>
            
            {testResult.error && (
              <div>
                <h4 className="font-semibold mb-2 text-destructive">Error:</h4>
                <p className="text-sm text-destructive">{testResult.error}</p>
              </div>
            )}
            
            {testResult.data && (
              <div>
                <h4 className="font-semibold mb-2">Data:</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Environment Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Required Environment Variables:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">DATABASE_URL</Badge>
                <span className="text-muted-foreground">
                  Azure PostgreSQL connection string
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY</Badge>
                <span className="text-muted-foreground">
                  Alpha Vantage API key for real-time stock data
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Next Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Update your <code>.env.local</code> file with your Azure PostgreSQL connection string</li>
              <li>Run <code>npx prisma db push</code> to sync the database schema</li>
              <li>Test the database connection using the buttons above</li>
              <li>Once successful, the watchlist feature will automatically use the database</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 