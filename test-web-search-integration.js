// Test script for Web Search API Integration
const API_BASE_URL = 'http://localhost:3000'

async function testWebSearchAPI() {
  console.log('🔍 Testing Web Search API Integration...\n')

  try {
    // Test 1: Basic web search
    console.log('📝 Test 1: Basic web search for "stock market news"')
    const response1 = await fetch(`${API_BASE_URL}/api/web-search?q=stock%20market%20news&limit=3`)
    const data1 = await response1.json()
    
    if (data1.success) {
      console.log('✅ Web search successful!')
      console.log(`📊 Found ${data1.count} results`)
      console.log(`⏱️ Search time: ${data1.searchTime}ms`)
      console.log(`🔗 Total results available: ${data1.totalResults}`)
      
      if (data1.data && data1.data.length > 0) {
        console.log('\n📰 Sample results:')
        data1.data.slice(0, 2).forEach((item, index) => {
          console.log(`${index + 1}. ${item.title}`)
          console.log(`   Source: ${item.source}`)
          console.log(`   Snippet: ${item.snippet.substring(0, 100)}...`)
          console.log('')
        })
      }
    } else {
      console.log('❌ Web search failed:', data1.message)
      if (data1.error) {
        console.log('Error details:', data1.error)
      }
    }

    // Test 2: Financial market search
    console.log('\n📝 Test 2: Financial market analysis search')
    const response2 = await fetch(`${API_BASE_URL}/api/web-search?q=financial%20market%20analysis%202024&limit=2`)
    const data2 = await response2.json()
    
    if (data2.success) {
      console.log('✅ Financial market search successful!')
      console.log(`📊 Found ${data2.count} results`)
    } else {
      console.log('❌ Financial market search failed:', data2.message)
    }

    // Test 3: POST request test
    console.log('\n📝 Test 3: POST request test')
    const response3 = await fetch(`${API_BASE_URL}/api/web-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'trading strategies 2024',
        limit: 2
      })
    })
    const data3 = await response3.json()
    
    if (data3.success) {
      console.log('✅ POST request successful!')
      console.log(`📊 Found ${data3.count} results`)
    } else {
      console.log('❌ POST request failed:', data3.message)
    }

    // Test 4: Error handling test
    console.log('\n📝 Test 4: Error handling test (empty query)')
    const response4 = await fetch(`${API_BASE_URL}/api/web-search?q=`)
    const data4 = await response4.json()
    
    if (!data4.success) {
      console.log('✅ Error handling working correctly:', data4.message)
    } else {
      console.log('❌ Error handling test failed - should have returned error for empty query')
    }

    console.log('\n🎉 Web Search API Integration Test Complete!')
    console.log('\n📋 Summary:')
    console.log('- API endpoint: /api/web-search')
    console.log('- Supports both GET and POST requests')
    console.log('- Uses Google Custom Search API')
    console.log('- Includes proper error handling')
    console.log('- Returns structured data with metadata')

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    console.log('\n🔧 Troubleshooting tips:')
    console.log('1. Make sure the development server is running (npm run dev)')
    console.log('2. Check that environment variables are set correctly')
    console.log('3. Verify Google Search API credentials are valid')
    console.log('4. Ensure the search engine ID is correct')
  }
}

// Run the test
testWebSearchAPI()
