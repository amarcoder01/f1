const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testSimpleToolCall() {
  console.log('🧪 Testing Simple Tool Call\n')

  const testQuery = "Please use the get_stock_quote tool to get the current price of AAPL stock."

  console.log(`📋 Test Query: "${testQuery}"`)
  
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
            content: testQuery
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    console.log(`📊 Response Status: ${response.status}`)
    console.log(`📝 Response Keys: ${Object.keys(data).join(', ')}`)
    
    if (data.message && data.message.toolCalls && data.message.toolCalls.length > 0) {
      console.log(`✅ Tool calls detected: ${data.message.toolCalls.length}`)
      data.message.toolCalls.forEach((toolCall, index) => {
        console.log(`  Tool ${index + 1}: ${toolCall.function.name}`)
        console.log(`  Arguments: ${toolCall.function.arguments}`)
      })
    } else if (data.message && data.message.toolResults && data.message.toolResults.length > 0) {
      console.log(`✅ Tool results detected: ${data.message.toolResults.length}`)
      data.message.toolResults.forEach((result, index) => {
        console.log(`  Result ${index + 1}: ${result.content.substring(0, 100)}...`)
      })
    } else {
      console.log(`❌ No tool calls or results detected`)
      console.log(`📄 Full response:`, JSON.stringify(data, null, 2))
    }
    
    if (data.message && data.message.content) {
      console.log(`📝 AI Response: ${data.message.content.substring(0, 200)}...`)
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    if (error.message.includes('ECONNREFUSED')) {
      console.log(`💡 Make sure the development server is running with: npm run dev`)
    }
  }
}

// Run the test
testSimpleToolCall().catch(console.error)
