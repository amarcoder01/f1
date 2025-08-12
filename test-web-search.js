// Test script for web search integration
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testWebSearch() {
  console.log('🧪 Testing Web Search Integration...\n')

  try {
    // Test 1: Basic web search
    console.log('📡 Test 1: Basic web search')
    const response1 = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Search the web for latest news about Tesla stock'
          }
        ]
      })
    })

    const result1 = await response1.json()
    console.log('✅ Basic web search test completed')
    console.log('Response:', JSON.stringify(result1, null, 2))
    console.log('')

    // Test 2: Trading-specific search
    console.log('📡 Test 2: Trading-specific search')
    const response2 = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'What are the latest trading strategies for tech stocks?'
          }
        ]
      })
    })

    const result2 = await response2.json()
    console.log('✅ Trading search test completed')
    console.log('Response:', JSON.stringify(result2, null, 2))
    console.log('')

    // Test 3: Market news
    console.log('📡 Test 3: Market news')
    const response3 = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Get me the latest market news'
          }
        ]
      })
    })

    const result3 = await response3.json()
    console.log('✅ Market news test completed')
    console.log('Response:', JSON.stringify(result3, null, 2))
    console.log('')

    // Test 4: Company information search
    console.log('📡 Test 4: Company information search')
    const response4 = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Search for information about Apple Inc company profile'
          }
        ]
      })
    })

    const result4 = await response4.json()
    console.log('✅ Company info search test completed')
    console.log('Response:', JSON.stringify(result4, null, 2))
    console.log('')

    console.log('🎉 All web search tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testWebSearch()
