// Test script for TreadGPT AI Chat API
const testAIChat = async () => {
  try {
    console.log('🧪 Testing TreadGPT AI Chat API...')
    
    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            id: '1',
            role: 'user',
            content: "What's the current price of AAPL?",
            timestamp: new Date()
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      console.error('❌ AI Chat Error:', data.error)
      return false
    }

    console.log('✅ AI Chat Response:', data.message.content.substring(0, 200) + '...')
    console.log('✅ Tool Calls:', data.message.toolCalls ? 'Yes' : 'No')
    console.log('✅ Tool Results:', data.message.toolResults ? 'Yes' : 'No')
    
    return true
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Run the test
testAIChat().then(success => {
  if (success) {
    console.log('🎉 TreadGPT AI Chat is working correctly!')
  } else {
    console.log('⚠️  TreadGPT AI Chat needs configuration')
  }
})
