const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testToolPriority() {
  console.log('🧪 Testing AI Tool Priority - Built-in Tools vs Web Search\n')

  const testCases = [
    {
      name: 'Stock Quote Query',
      message: 'Please use the get_stock_quote tool to get the current price of AAPL',
      expectedTool: 'get_stock_quote',
      description: 'Should use built-in stock quote tool first'
    },
    {
      name: 'Stock Search Query',
      message: 'Please use the search_stocks tool to find information about Apple Inc',
      expectedTool: 'search_stocks',
      description: 'Should use built-in stock search tool first'
    },
    {
      name: 'Technical Analysis Query',
      message: 'Please use the analyze_stock tool to analyze the technical indicators for MSFT',
      expectedTool: 'analyze_stock',
      description: 'Should use built-in analysis tool first'
    },
    {
      name: 'Company Info Query',
      message: 'Please use the get_company_info tool to get Google company fundamentals',
      expectedTool: 'get_company_info',
      description: 'Should use built-in company info tool first'
    },
    {
      name: 'Market Data Query',
      message: 'Please use the get_market_data tool to get current market indices',
      expectedTool: 'get_market_data',
      description: 'Should use built-in market data tool first'
    },
    {
      name: 'General Knowledge Query',
      message: 'Please use the search_web tool to find the latest news about AI technology',
      expectedTool: 'search_web',
      description: 'Should use web search for general knowledge'
    },
    {
      name: 'Recent News Query',
      message: 'Please use the get_market_news tool to get the latest market news updates',
      expectedTool: 'get_market_news',
      description: 'Should use web search for recent news'
    }
  ]

  let correctToolCalls = 0
  let totalTests = testCases.length

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`)
    console.log(`Query: "${testCase.message}"`)
    console.log(`Expected Tool: ${testCase.expectedTool}`)
    console.log(`Description: ${testCase.description}`)
    
    try {
      const response = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: testCase.message
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      console.log(`📊 Response Status: ${response.status}`)
      
      if (data.message && data.message.toolCalls && data.message.toolCalls.length > 0) {
        const usedTool = data.message.toolCalls[0].function.name
        const isCorrect = usedTool === testCase.expectedTool
        
        console.log(`✅ Used Tool: ${usedTool}`)
        console.log(`🎯 Priority Correct: ${isCorrect ? 'YES' : 'NO'}`)
        
        if (isCorrect) {
          correctToolCalls++
        } else {
          console.log(`⚠️  Expected ${testCase.expectedTool} but got ${usedTool}`)
        }
      } else if (data.message && data.message.toolResults && data.message.toolResults.length > 0) {
        console.log(`✅ Tool results detected but tool calls not shown in response`)
        console.log(`📝 Tool results: ${data.message.toolResults.length} results found`)
      } else {
        console.log(`❌ No tool calls detected`)
        console.log(`📄 Response structure:`, JSON.stringify(data, null, 2).substring(0, 300))
      }
      
      // Show response content if available
      if (data.message && data.message.content) {
        console.log(`📝 Response: ${data.message.content.substring(0, 100)}...`)
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`)
      if (error.message.includes('ECONNREFUSED')) {
        console.log(`💡 Make sure the development server is running with: npm run dev`)
      }
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  console.log('\n🎯 Tool Priority Test Summary:')
  console.log(`✅ Correct tool calls: ${correctToolCalls}/${totalTests}`)
  console.log(`📊 Success rate: ${((correctToolCalls / totalTests) * 100).toFixed(1)}%`)
  console.log('\nThe AI should prioritize built-in real-time data tools for stock-related queries')
  console.log('and only use web search for general knowledge or recent news not available in real-time data.')
}

// Run the test
testToolPriority().catch(console.error)
