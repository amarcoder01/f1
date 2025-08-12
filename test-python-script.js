// Test script to check Python script execution
const testPythonScript = async () => {
  console.log('🐍 Testing Python script execution...')
  
  try {
    // Test 1: Check if Python script exists
    console.log('\n1️⃣ Checking if Python script exists...')
    const scriptResponse = await fetch('/scripts/yfinance_quote.py')
    if (scriptResponse.ok) {
      console.log('✅ Python script is accessible')
    } else {
      console.log('❌ Python script not accessible:', scriptResponse.status)
    }
    
    // Test 2: Try to execute Python script via API
    console.log('\n2️⃣ Testing Python script execution via API...')
    const apiResponse = await fetch('/api/chart/AAPL?range=1d&interval=1m')
    const apiData = await apiResponse.json()
    
    console.log('API Response:', apiData)
    
    if (apiData.error) {
      console.log('⚠️ API error (this might be expected):', apiData.error)
    }
    
    if (apiData.data && apiData.data.length > 0) {
      console.log('✅ Chart data received successfully')
      console.log('Data points:', apiData.data.length)
      console.log('Sample data:', apiData.data[0])
    } else {
      console.log('⚠️ No chart data received')
    }
    
  } catch (error) {
    console.error('❌ Error testing Python script:', error)
  }
}

// Test different timeframes
const testTimeframes = async () => {
  console.log('\n⏰ Testing different timeframes...')
  
  const timeframes = ['1d', '5d', '1mo', '3mo']
  
  for (const timeframe of timeframes) {
    try {
      console.log(`\nTesting timeframe: ${timeframe}`)
      const response = await fetch(`/api/chart/AAPL?range=${timeframe}&interval=1m`)
      const data = await response.json()
      
      if (data.error) {
        console.log(`❌ ${timeframe}: ${data.error}`)
      } else if (data.data && data.data.length > 0) {
        console.log(`✅ ${timeframe}: ${data.data.length} data points`)
      } else {
        console.log(`⚠️ ${timeframe}: No data`)
      }
    } catch (error) {
      console.error(`❌ ${timeframe}: Error`, error)
    }
  }
}

// Run tests
console.log('🚀 Starting Python Script Tests...')
testPythonScript().then(() => {
  console.log('\n🐍 Python script test completed')
  return testTimeframes()
}).then(() => {
  console.log('\n🎯 All tests completed')
}).catch(error => {
  console.error('💥 Test suite failed:', error)
})
