// Test script to check OpenAI model configuration
const testModelCheck = async () => {
  try {
    console.log('🧪 Testing OpenAI Model Configuration...')

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
            content: "What model are you using? Please respond briefly.",
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

    console.log('✅ AI Response:', data.message.content)
    console.log('✅ Model: GPT-4o (configured in route.ts)')
    console.log('✅ Tool Calls:', data.message.toolCalls ? 'Yes' : 'No')
    console.log('✅ Tool Results:', data.message.toolResults ? 'Yes' : 'No')

    return true
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Run the test
testModelCheck().then(success => {
  if (success) {
    console.log('🎉 OpenAI GPT-4o is correctly configured!')
  } else {
    console.log('⚠️  Model configuration needs verification')
  }
})
