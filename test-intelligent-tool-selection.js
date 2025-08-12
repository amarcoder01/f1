const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testIntelligentToolSelection() {
  console.log('🧪 Testing Intelligent Tool Selection - Expert AI Decisions\n')

  const testCases = [
    {
      name: 'Chart Request (Should use web search)',
      message: 'Show me a chart of Google stock',
      expectedTool: 'search_web',
      description: 'Charts are not available in real-time data, should use web search'
    },
    {
      name: 'Current Price (Should use built-in tool)',
      message: 'What is the current price of AAPL?',
      expectedTool: 'get_stock_quote',
      description: 'Current prices are available in real-time data'
    },
    {
      name: 'Technical Analysis (Should use built-in tool)',
      message: 'Analyze the technical indicators for MSFT',
      expectedTool: 'analyze_stock',
      description: 'Technical analysis is available in built-in tools'
    },
    {
      name: 'Company Fundamentals (Should use built-in tool)',
      message: 'Tell me about Apple company fundamentals',
      expectedTool: 'get_company_info',
      description: 'Company fundamentals are available in real-time data'
    },
    {
      name: 'Latest News (Should use web search)',
      message: 'What are the latest news about Tesla?',
      expectedTool: 'search_web',
      description: 'Recent news is not available in real-time data'
    },
    {
      name: 'Stock Search (Should use built-in tool)',
      message: 'Find information about Tesla stock',
      expectedTool: 'search_stocks',
      description: 'Stock search is available in built-in tools'
    },
    {
      name: 'Market Indices (Should use built-in tool)',
      message: 'What are the current market indices?',
      expectedTool: 'get_market_data',
      description: 'Market indices are available in real-time data'
    },
    {
      name: 'Image Request (Should use web search)',
      message: 'Show me an image of the Tesla logo',
      expectedTool: 'search_web',
      description: 'Images are not available in built-in tools'
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
      const response = await fetch('http://localhost:3001/api/ai/chat', {
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
        console.log(`🎯 Intelligent Choice: ${isCorrect ? 'YES' : 'NO'}`)
        
        if (isCorrect) {
          correctToolCalls++
          console.log(`✅ AI made the right choice!`)
        } else {
          console.log(`⚠️  Expected ${testCase.expectedTool} but got ${usedTool}`)
          console.log(`💡 AI should have used ${testCase.expectedTool} for this task`)
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

  console.log('\n🎯 Intelligent Tool Selection Test Summary:')
  console.log(`✅ Correct tool choices: ${correctToolCalls}/${totalTests}`)
  console.log(`📊 Success rate: ${((correctToolCalls / totalTests) * 100).toFixed(1)}%`)
  console.log('\nThe AI should intelligently choose the best tool for each task:')
  console.log('- Use built-in tools for real-time data (prices, fundamentals, technical analysis)')
  console.log('- Use web search for charts, images, news, or information not in real-time data')
  console.log('- Think like an expert and choose wisely!')
}

// Run the test
testIntelligentToolSelection().catch(console.error)
