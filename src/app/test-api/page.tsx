'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestAPIPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [stockResult, setStockResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testPolygonAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-polygon')
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const testSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stocks/search?q=PFE')
      const data = await response.json()
      setSearchResult(data)
    } catch (error) {
      setSearchResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const testStock = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stocks/AAPL')
      const data = await response.json()
      setStockResult(data)
    } catch (error) {
      setStockResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">API Testing Page</h1>
      
      <div className="space-y-4">
        <div>
          <Button onClick={testPolygonAPI} disabled={loading}>
            Test Polygon.io API
          </Button>
          {testResult && (
            <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <Button onClick={testSearch} disabled={loading}>
            Test Search API (PFE)
          </Button>
          {searchResult && (
            <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(searchResult, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <Button onClick={testStock} disabled={loading}>
            Test Individual Stock API (AAPL)
          </Button>
          {stockResult && (
            <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(stockResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}