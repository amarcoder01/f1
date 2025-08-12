const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testExpertDecisions() {
  console.log('🧠 Testing Expert AI Decision Making\n')

  const expertScenarios = [
    {
      name: 'Chart Request - Expert Choice',
      message: 'Give me a chart of Google stock',
      expectedTool: 'search_web',
      reasoning: 'Charts require visual data not available in real-time APIs'
    },
    {
      name: 'Real-time Price - Expert Choice',
      message: 'What is AAPL trading at right now?',
      expectedTool: 'get_stock_quote',
      reasoning: 'Current prices are available in real-time data'
    },
    {
      name: 'Technical Analysis - Expert Choice',
      message: 'Analyze the technical indicators for Microsoft',
      expectedTool: 'analyze_stock',
      reasoning: 'Technical analysis is available in built-in tools'
    },
    {
      name: 'Company Research - Expert Choice',
      message: 'Tell me about Tesla company fundamentals',
      expectedTool: 'get_company_info',
      reasoning: 'Company fundamentals are in real-time data'
    },
    {
      name: 'Latest News - Expert Choice',
      message: 'What are the latest news about Apple?',
      expectedTool: 'search_web',
      reasoning: 'Recent news requires web search'
    },
    {
      name: 'Market Overview - Expert Choice',
      message: 'How are the markets performing today?',
      expectedTool: 'get_market_data',
      reasoning: 'Market indices are available in real-time data'
    },
    {
      name: 'Image Request - Expert Choice',
      message: 'Show me the Apple logo',
      expectedTool: 'search_web',
      reasoning: 'Images require web search'
    },
    {
      name: 'Stock Search - Expert Choice',
      message: 'Find information about NVIDIA',
      expectedTool: 'search_stocks',
      reasoning: 'Stock search is available in built-in tools'
    }
  ]

  let correctDecisions = 0
  let totalScenarios = expertScenarios.length

  for (const scenario of expertScenarios) {
    console.log(`\n🧠 Expert Scenario: ${scenario.name}`)
    console.log(`Query: "${scenario.message}"`)
    console.log(`Expected Tool: ${scenario.expectedTool}`)
    console.log(`Expert Reasoning: ${scenario.reasoning}`)
    
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
              content: scenario.message
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.message && data.message.toolCalls && data.message.toolCalls.length > 0) {
        const usedTool = data.message.toolCalls[0].function.name
        const isCorrect = usedTool === scenario.expectedTool
        
        console.log(`✅ AI Decision: ${usedTool}`)
        console.log(`🎯 Expert Decision: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`)
        
        if (isCorrect) {
          correctDecisions++
          console.log(`✅ AI made the expert choice!`)
        } else {
          console.log(`⚠️  Expected ${scenario.expectedTool} but got ${usedTool}`)
          console.log(`💡 AI should have used ${scenario.expectedTool} for this scenario`)
        }
      } else if (data.message && data.message.toolResults && data.message.toolResults.length > 0) {
        console.log(`✅ Tool results detected`)
        console.log(`📝 Tool results: ${data.message.toolResults.length} results found`)
      } else {
        console.log(`❌ No tool calls detected`)
      }
      
      // Show response content if available
      if (data.message && data.message.content) {
        console.log(`📝 AI Response: ${data.message.content.substring(0, 100)}...`)
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

  console.log('\n🧠 Expert Decision Making Test Summary:')
  console.log(`✅ Correct expert decisions: ${correctDecisions}/${totalScenarios}`)
  console.log(`📊 Success rate: ${((correctDecisions / totalScenarios) * 100).toFixed(1)}%`)
  
  if (correctDecisions === totalScenarios) {
    console.log(`🎉 PERFECT! AI is making expert-level decisions!`)
  } else if (correctDecisions >= totalScenarios * 0.8) {
    console.log(`👍 EXCELLENT! AI is making mostly expert decisions!`)
  } else if (correctDecisions >= totalScenarios * 0.6) {
    console.log(`✅ GOOD! AI is making good decisions!`)
  } else {
    console.log(`⚠️  NEEDS IMPROVEMENT: AI needs better decision making`)
  }
  
  console.log('\n🎯 Expert Decision Making Principles:')
  console.log('- Use real-time data for current prices, fundamentals, technical analysis')
  console.log('- Use web search for charts, images, news, or information not in real-time data')
  console.log('- Think like an expert and choose the most appropriate tool')
  console.log('- Always explain the reasoning behind tool selection')
}

// Run the test
testExpertDecisions().catch(console.error)
