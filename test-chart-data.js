// Test script to check chart data API
const testChartData = async () => {
  try {
    console.log('Testing chart data API...')
    
    // Test with a common stock symbol
    const response = await fetch('/api/chart/AAPL?range=1d&interval=1m')
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText)
      return
    }
    
    const data = await response.json()
    console.log('Chart API response:', data)
    
    if (data.error) {
      console.error('API returned error:', data.error)
    }
    
    if (data.data && data.data.length > 0) {
      console.log('Chart data sample:', data.data[0])
      console.log('Total data points:', data.data.length)
      console.log('Data format check:')
      console.log('- Has time:', 'time' in data.data[0])
      console.log('- Has open:', 'open' in data.data[0])
      console.log('- Has high:', 'high' in data.data[0])
      console.log('- Has low:', 'low' in data.data[0])
      console.log('- Has close:', 'close' in data.data[0])
      console.log('- Has volume:', 'volume' in data.data[0])
    } else {
      console.log('No chart data received')
    }
    
  } catch (error) {
    console.error('Error testing chart API:', error)
  }
}

// Run the test
testChartData()
