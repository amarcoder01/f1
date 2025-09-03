'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Loader2,
  Info,
  Settings,
  TestTube
} from 'lucide-react'

interface DatabaseStatus {
  isConnected: boolean
  isInitialized: boolean
  error?: string
}

interface HealthCheck {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  responseTime: string
  database: {
    status: string
    initialized: boolean
    error: string | null
  }
  environment: {
    nodeEnv: string
    hasDatabaseUrl: boolean
    hasJwtSecret: boolean
  }
  uptime: number
  memory: any
}

export default function DatabaseTestPage() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const testDatabaseConnection = async () => {
    setIsTesting(true)
    setError(null)
    setTestResults([])

    try {
      console.log('🧪 Testing database connection...')
      
      // Test basic connection
      const response = await fetch('/api/db/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTestResults(prev => [...prev, {
          test: 'Basic Connection Test',
          status: 'success',
          message: 'Database connection successful',
          details: data.data
        }])
      } else {
        setTestResults(prev => [...prev, {
          test: 'Basic Connection Test',
          status: 'error',
          message: 'Database connection failed',
          details: data.error
        }])
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Basic Connection Test',
        status: 'error',
        message: 'Request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }])
    }

    // Test health check endpoint
    try {
      const healthResponse = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const healthData = await healthResponse.json()
      setHealthCheck(healthData)
      
      if (healthData.status === 'ok') {
        setTestResults(prev => [...prev, {
          test: 'Health Check',
          status: 'success',
          message: 'Health check passed',
          details: `Status: ${healthData.status}, Response: ${healthData.responseTime}`
        }])
      } else {
        setTestResults(prev => [...prev, {
          test: 'Health Check',
          status: 'error',
          message: 'Health check failed',
          details: `Status: ${healthData.status}, Error: ${healthData.error}`
        }])
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Health Check',
        status: 'error',
        message: 'Health check request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }])
    }

    // Test database operations
    try {
      const operationsResponse = await fetch('/api/db/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testOperations: true })
      })
      
      const operationsData = await operationsResponse.json()
      
      if (operationsData.success) {
        setTestResults(prev => [...prev, {
          test: 'Database Operations',
          status: 'success',
          message: 'Database operations successful',
          details: operationsData.data
        }])
      } else {
        setTestResults(prev => [...prev, {
          test: 'Database Operations',
          status: 'error',
          message: 'Database operations failed',
          details: operationsData.error
        }])
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Database Operations',
        status: 'error',
        message: 'Database operations request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }])
    }

    setIsTesting(false)
  }

  const runHealthCheck = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealthCheck(data)
      setError(null)
    } catch (error) {
      setError('Failed to fetch health check')
      console.error('Health check error:', error)
    }
  }

  useEffect(() => {
    runHealthCheck()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'degraded': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-4 h-4" />
      case 'degraded': return <AlertTriangle className="w-4 h-4" />
      case 'error': return <XCircle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Database className="w-8 h-8" />
          Database Connection Test
        </h1>
        <p className="text-muted-foreground">
          Test and diagnose database connectivity issues
        </p>
      </div>

      {/* Health Status Overview */}
      {healthCheck && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              System Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(healthCheck.status)}>
                    {getStatusIcon(healthCheck.status)}
                    {healthCheck.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {healthCheck.responseTime}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last checked: {new Date(healthCheck.timestamp).toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Database:</span>
                  <Badge variant={healthCheck.database.status === 'connected' ? 'default' : 'destructive'}>
                    {healthCheck.database.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Initialized:</span>
                  <Badge variant={healthCheck.database.initialized ? 'default' : 'secondary'}>
                    {healthCheck.database.initialized ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            {healthCheck.database.error && (
              <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  Database Error: {healthCheck.database.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Environment Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Environment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">DATABASE_URL:</span>
                <Badge variant={healthCheck?.environment.hasDatabaseUrl ? 'default' : 'destructive'}>
                  {healthCheck?.environment.hasDatabaseUrl ? 'Configured' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">JWT_SECRET:</span>
                <Badge variant={healthCheck?.environment.hasJwtSecret ? 'default' : 'secondary'}>
                  {healthCheck?.environment.hasJwtSecret ? 'Configured' : 'Missing'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Environment:</span>
                <Badge variant="outline">
                  {healthCheck?.environment.nodeEnv || 'Unknown'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Uptime:</span>
                <span className="text-sm text-muted-foreground">
                  {healthCheck ? Math.floor(healthCheck.uptime / 60) : 0} minutes
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Database Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={testDatabaseConnection} 
              disabled={isTesting}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              {isTesting ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <Button 
              onClick={runHealthCheck} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Health Check
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium">{result.test}</span>
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                  {result.details && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <pre className="text-xs text-gray-700 dark:text-gray-300">
                        {typeof result.details === 'object' 
                          ? JSON.stringify(result.details, null, 2)
                          : result.details
                        }
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Common Issues & Solutions:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>DATABASE_URL missing:</strong> Check your .env.local file</li>
                <li>• <strong>Connection refused:</strong> Verify database server is running</li>
                <li>• <strong>Authentication failed:</strong> Check username/password in connection string</li>
                <li>• <strong>Engine not connected:</strong> Restart the development server</li>
                <li>• <strong>SSL issues:</strong> Add ?sslmode=require to your DATABASE_URL</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Quick Fixes:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Run <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npx prisma generate</code></li>
                <li>• Run <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npx prisma db push</code></li>
                <li>• Restart your development server</li>
                <li>• Check database server status</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 