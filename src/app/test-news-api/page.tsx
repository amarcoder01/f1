'use client'

import React, { useState } from 'react'

export default function TestNewsAPIPage() {
  const [symbol, setSymbol] = useState('V')
  const [limit, setLimit] = useState(5)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testNewsAPI = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch(`/api/test-news-api?symbol=${encodeURIComponent(symbol)}&limit=${limit}`)
      
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

  const testChatWithNews = async () => {
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
              content: `Get the latest news about ${symbol}`
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
        <h1 className="text-3xl font-bold mb-8">News API Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test News API Functionality</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter stock symbol..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Articles
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={testNewsAPI}
                disabled={loading}
                className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test News API'}
              </button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={testChatWithNews}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Chat with News'}
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
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800 font-medium">✅ {results.message}</p>
                </div>
                
                {results.test && (
                  <div className="space-y-6">
                    {/* News Results */}
                    <div className="border rounded p-4">
                      <h4 className="font-medium text-blue-600 mb-3">
                        📰 Financial News ({results.test.news.count} articles)
                      </h4>
                      {results.test.news.articles.map((article: any, index: number) => (
                        <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
                          <h5 className="font-medium">{article.title}</h5>
                          <p className="text-sm text-gray-600">Source: {article.source}</p>
                          <p className="text-sm text-gray-600">
                            Published: {new Date(article.publishedAt).toLocaleDateString()}
                          </p>
                          {article.sentiment && (
                            <p className="text-sm text-gray-600">
                              Sentiment: {article.sentiment.label} ({article.sentiment.score})
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            Category: {article.category} | Relevance: {article.relevance}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Earnings Results */}
                    <div className="border rounded p-4">
                      <h4 className="font-medium text-green-600 mb-3">
                        📅 Earnings Calendar ({results.test.earnings.count} events)
                      </h4>
                      {results.test.earnings.events.map((earning: any, index: number) => (
                        <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
                          <h5 className="font-medium">{earning.symbol} - {earning.companyName}</h5>
                          <p className="text-sm text-gray-600">
                            Report Date: {new Date(earning.reportDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Estimate: ${earning.estimate}
                          </p>
                          {earning.sentiment && (
                            <p className="text-sm text-gray-600">
                              Sentiment: {earning.sentiment.label} ({earning.sentiment.score})
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Sentiment Results */}
                    <div className="border rounded p-4">
                      <h4 className="font-medium text-purple-600 mb-3">
                        📊 Social Media Sentiment
                      </h4>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm">
                          <strong>Score:</strong> {results.test.sentiment.score}
                        </p>
                        <p className="text-sm">
                          <strong>Label:</strong> {results.test.sentiment.label}
                        </p>
                        <p className="text-sm">
                          <strong>Confidence:</strong> {results.test.sentiment.confidence}
                        </p>
                      </div>
                    </div>
                    
                    {/* Analyzed News Results */}
                    <div className="border rounded p-4">
                      <h4 className="font-medium text-orange-600 mb-3">
                        🤖 Analyzed News Sentiment ({results.test.analyzedNews.count} articles)
                      </h4>
                      {results.test.analyzedNews.articles.map((article: any, index: number) => (
                        <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
                          <h5 className="font-medium">{article.title}</h5>
                          {article.sentiment && (
                            <p className="text-sm text-gray-600">
                              Sentiment: {article.sentiment.label} ({article.sentiment.score})
                            </p>
                          )}
                        </div>
                      ))}
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
