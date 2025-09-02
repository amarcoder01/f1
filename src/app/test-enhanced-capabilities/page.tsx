'use client'

import React, { useState } from 'react'

export default function TestEnhancedCapabilitiesPage() {
  const [testType, setTestType] = useState('universal')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testCapabilities = async () => {
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
              content: query
            }
          ],
          'x-session-id': 'test-enhanced-session',
          'x-user-id': 'test-enhanced-user'
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

  const predefinedTests = {
    universal: [
      "Research the impact of quantum computing on modern cryptography",
      "Analyze the benefits and challenges of renewable energy adoption",
      "Explain the concept of machine learning to a beginner",
      "What are the latest developments in space exploration?",
      "How does blockchain technology work and what are its applications?"
    ],
    reasoning: [
      "Use chain-of-thought reasoning to solve: If a train travels 120 km in 2 hours, how long will it take to travel 300 km at the same speed?",
      "Analyze the strategic position of Tesla in the electric vehicle market using SWOT analysis",
      "Test the hypothesis: 'Remote work increases productivity' using logical reasoning",
      "Use creative problem solving to find ways to reduce plastic waste in cities",
      "Perform logical deduction: All mammals have lungs. Whales are mammals. Therefore..."
    ],
    memory: [
      "Analyze our conversation context and adapt your response style to my preferences",
      "Identify knowledge gaps in my understanding of financial markets",
      "Learn from my interaction patterns and provide personalized insights",
      "Generate personalized recommendations based on my trading interests",
      "Adapt your communication style to match my expertise level"
    ],
    translation: [
      "Translate 'Hello, how are you today?' to Spanish with a formal tone",
      "Translate this technical document to French while preserving technical terminology",
      "Translate 'Good morning, thank you for your help' to Japanese with cultural context",
      "Translate this business email to German with professional style",
      "Translate 'I love learning new languages' to Italian with casual tone"
    ],
    content: [
      "Generate a comprehensive report about artificial intelligence trends in 2024",
      "Create a presentation about sustainable business practices",
      "Write a technical blog post about cloud computing security",
      "Generate a creative story about time travel",
      "Create a step-by-step guide for beginners learning to code"
    ],
    mathematical: [
      "Solve the equation: 2x + 5 = 13 with step-by-step explanation",
      "Calculate the derivative of f(x) = x^2 + 3x + 1",
      "Solve the quadratic equation: x^2 - 5x + 6 = 0",
      "Find the area of a circle with radius 7 units",
      "Solve the system of equations: 2x + y = 5, x - y = 1"
    ]
  }

  const runPredefinedTest = (testQuery: string) => {
    setQuery(testQuery)
    setTimeout(() => testCapabilities(), 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🧠 TradeGPT Enhanced Capabilities Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Enhanced Capabilities</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="universal">Universal Knowledge</option>
                <option value="reasoning">Enhanced Reasoning</option>
                <option value="memory">Enhanced Memory</option>
                <option value="translation">Language Translation</option>
                <option value="content">Content Generation</option>
                <option value="mathematical">Mathematical Problem Solving</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Query
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your test query..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={testCapabilities}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Capabilities'}
            </button>
          </div>
        </div>

        {/* Predefined Tests */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Predefined Test Examples</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedTests[testType as keyof typeof predefinedTests]?.map((testQuery, index) => (
              <button
                key={index}
                onClick={() => runPredefinedTest(testQuery)}
                disabled={loading}
                className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <p className="text-sm text-gray-700 line-clamp-3">{testQuery}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Capability Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">🧠 Universal Knowledge</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Content analysis (text, images, documents)</li>
              <li>• Comprehensive research on any topic</li>
              <li>• Problem solving in any domain</li>
              <li>• Multi-language translation</li>
              <li>• Content generation</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-600">🔍 Enhanced Reasoning</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Chain-of-thought reasoning</li>
              <li>• Multi-step problem solving</li>
              <li>• Hypothesis testing</li>
              <li>• Creative problem solving</li>
              <li>• Strategic analysis</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-600">🧠 Enhanced Memory</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Conversation context analysis</li>
              <li>• User pattern learning</li>
              <li>• Knowledge gap identification</li>
              <li>• Response style adaptation</li>
              <li>• Personalized insights</li>
            </ul>
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
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Query:</h4>
                <p className="text-gray-700">{query}</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded">
                <h4 className="font-medium mb-2">AI Response:</h4>
                <div className="whitespace-pre-wrap text-gray-700">{results.content}</div>
              </div>
              
              {results.toolsUsed && (
                <div className="p-4 bg-green-50 rounded">
                  <h4 className="font-medium mb-2">Tools Used:</h4>
                  <ul className="text-sm text-gray-700">
                    {results.toolsUsed.map((tool: string, index: number) => (
                      <li key={index}>• {tool}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.metadata && (
                <div className="p-4 bg-yellow-50 rounded">
                  <h4 className="font-medium mb-2">Metadata:</h4>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(results.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
