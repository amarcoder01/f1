'use client'

import React, { useState } from 'react'

export default function TestWebSearchPage() {
  const [query, setQuery] = useState('Tesla stock news')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testWebSearch = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch(`/api/test-web-search?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setResults(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const testChatWithWebSearch = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Search for the latest news about ${query}`
            }
          ],
          'x-session-id': 'test-session',
          'x-user-id': 'test-user'
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setResults(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Web Search Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Web Search Functionality</h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search query..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={testWebSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Web Search'}
            </button>
            <button
              onClick={testChatWithWebSearch}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Chat with Web Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Test Results</h3>
            
            {results.success ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800 font-medium">✅ {results.message}</p>
                </div>
                
                {results.test && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Query: {results.test.query}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded p-3">
                        <h5 className="font-medium text-blue-600">Basic Search ({results.test.basicSearch.count} results)</h5>
                        {results.test.basicSearch.results.map((result: any, index: number) => (
                          <div key={index} className="mt-2 text-sm">
                            <p className="font-medium">{result.title}</p>
                            <p className="text-gray-600">{result.snippet}</p>
                            <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {result.displayLink}
                            </a>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border rounded p-3">
                        <h5 className="font-medium text-green-600">Trading Search ({results.test.tradingSearch.count} results)</h5>
                        {results.test.tradingSearch.results.map((result: any, index: number) => (
                          <div key={index} className="mt-2 text-sm">
                            <p className="font-medium">{result.title}</p>
                            <p className="text-gray-600">{result.snippet}</p>
                            <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {result.displayLink}
                            </a>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border rounded p-3">
                        <h5 className="font-medium text-purple-600">Company Search ({results.test.companySearch.count} results)</h5>
                        {results.test.companySearch.results.map((result: any, index: number) => (
                          <div key={index} className="mt-2 text-sm">
                            <p className="font-medium">{result.title}</p>
                            <p className="text-gray-600">{result.snippet}</p>
                            <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {result.displayLink}
                            </a>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border rounded p-3">
                        <h5 className="font-medium text-orange-600">Market News ({results.test.marketNews.count} results)</h5>
                        {results.test.marketNews.results.map((result: any, index: number) => (
                          <div key={index} className="mt-2 text-sm">
                            <p className="font-medium">{result.title}</p>
                            <p className="text-gray-600">{result.snippet}</p>
                            <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {result.displayLink}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {results.content && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h4 className="font-medium mb-2">Chat Response:</h4>
                    <div className="whitespace-pre-wrap text-sm">{results.content}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">❌ {results.message}</p>
                {results.error && (
                  <p className="text-red-600 mt-2">Error details: {results.error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
