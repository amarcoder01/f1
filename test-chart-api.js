// Test script to check chart API functionality
const testChartAPI = async () => {
  console.log('🧪 Testing Chart API...')
  
  try {
    // Test 1: Check if the API endpoint exists
    console.log('\n1️⃣ Testing API endpoint existence...')
    const response = await fetch('/api/chart/AAPL?range=1d&interval=1m')
    console.log('✅ API endpoint exists, status:', response.status)
    
    // Test 2: Check response format
    console.log('\n2️⃣ Testing response format...')
    const data = await response.json()
    console.log('Response data:', data)
    
    // Test 3: Validate data structure
    console.log('\n3️⃣ Validating data structure...')
    if (data.error) {
      console.log('⚠️ API returned error:', data.error)
    }
    
    if (data.data && Array.isArray(data.data)) {
      console.log('✅ Data is an array with length:', data.data.length)
      
      if (data.data.length > 0) {
        const firstItem = data.data[0]
        console.log('First data item:', firstItem)
        
        // Check required fields
        const requiredFields = ['time', 'open', 'high', 'low', 'close', 'volume']
        const missingFields = requiredFields.filter(field => !(field in firstItem))
        
        if (missingFields.length === 0) {
          console.log('✅ All required fields present')
        } else {
          console.log('❌ Missing fields:', missingFields)
        }
        
        // Check data types
        const typeChecks = {
          time: typeof firstItem.time === 'number',
          open: typeof firstItem.open === 'number',
          high: typeof firstItem.high === 'number',
          low: typeof firstItem.low === 'number',
          close: typeof firstItem.close === 'number',
          volume: typeof firstItem.volume === 'number'
        }
        
        console.log('Data type validation:', typeChecks)
        
        const invalidTypes = Object.entries(typeChecks).filter(([field, isValid]) => !isValid)
        if (invalidTypes.length === 0) {
          console.log('✅ All data types are correct')
        } else {
          console.log('❌ Invalid data types:', invalidTypes.map(([field]) => field))
        }
      } else {
        console.log('⚠️ Data array is empty')
      }
    } else {
      console.log('❌ Data is not an array or missing')
    }
    
  } catch (error) {
    console.error('❌ Error testing chart API:', error)
  }
}

// Test with different symbols
const testMultipleSymbols = async () => {
  console.log('\n🔍 Testing multiple symbols...')
  
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA']
  
  for (const symbol of symbols) {
    try {
      console.log(`\nTesting ${symbol}...`)
      const response = await fetch(`/api/chart/${symbol}?range=1d&interval=1m`)
      const data = await response.json()
      
      if (data.error) {
        console.log(`❌ ${symbol}: ${data.error}`)
      } else if (data.data && data.data.length > 0) {
        console.log(`✅ ${symbol}: ${data.data.length} data points`)
      } else {
        console.log(`⚠️ ${symbol}: No data`)
      }
    } catch (error) {
      console.error(`❌ ${symbol}: Error`, error)
    }
  }
}

// Run tests
console.log('🚀 Starting Chart API Tests...')
testChartAPI().then(() => {
  console.log('\n📊 Chart API test completed')
  return testMultipleSymbols()
}).then(() => {
  console.log('\n🎯 All tests completed')
}).catch(error => {
  console.error('💥 Test suite failed:', error)
})
