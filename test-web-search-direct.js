// Direct test for web search API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testWebSearchDirect() {
  console.log('🧪 Testing Web Search API Directly...\n')

  try {
    // Test the web search utility directly
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Search for the latest news about artificial intelligence in 2024'
          }
        ]
      })
    })

    const result = await response.json()
    
    if (result.message && result.message.content) {
      console.log('✅ Web search test successful!')
      console.log('📝 Response preview:', result.message.content.substring(0, 200) + '...')
      
      if (result.toolCalls && result.toolCalls.length > 0) {
        console.log('🔧 Tool calls detected:', result.toolCalls.length)
        result.toolCalls.forEach((toolCall, index) => {
          console.log(`  ${index + 1}. ${toolCall.function.name}: ${toolCall.function.arguments}`)
        })
      }
      
      if (result.toolResults && result.toolResults.length > 0) {
        console.log('📊 Tool results found:', result.toolResults.length)
        result.toolResults.forEach((toolResult, index) => {
          try {
            const parsed = JSON.parse(toolResult.content)
            console.log(`  ${index + 1}. Found ${parsed.count || 0} results from ${parsed.source || 'unknown'}`)
          } catch (e) {
            console.log(`  ${index + 1}. Raw result available`)
          }
        })
      }
    } else {
      console.log('❌ No response content found')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testWebSearchDirect()
