const fetch = require('node-fetch')

async function testWatchlistAPI() {
  try {
    console.log('🔍 Testing watchlist API...')
    
    const response = await fetch('http://localhost:3000/api/watchlist')
    console.log('📡 Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📊 Response data:', JSON.stringify(data, null, 2))
      
      if (data.success && data.data) {
        console.log(`📋 Found ${data.data.length} watchlists`)
        data.data.forEach((watchlist, index) => {
          console.log(`   ${index + 1}. "${watchlist.name}" (${watchlist.id})`)
          console.log(`      Items: ${watchlist.items?.length || 0}`)
          if (watchlist.items && watchlist.items.length > 0) {
            console.log(`      Symbols: ${watchlist.items.map(item => item.symbol).join(', ')}`)
          }
        })
      }
    } else {
      console.error('❌ API request failed:', response.status, response.statusText)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testWatchlistAPI()
