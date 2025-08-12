require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testChartAPI() {
  console.log('🧪 Testing Chart API Route...');
  
  try {
    // Test the API route
    const response = await fetch('http://localhost:3000/api/chart/AAPL?interval=1d&range=1mo');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      console.log('✅ Chart API route is working!');
      console.log(`📊 Fetched ${data.data.length} data points for AAPL`);
      console.log(`📈 Source: ${data.source}`);
      console.log(`💰 Latest price: $${data.data[data.data.length - 1].close}`);
      
      // Test chart image generation
      const chartPoints = data.data.map(point => ({
        x: new Date(point.time).toISOString().split('T')[0],
        y: point.close
      })).filter(point => point.y > 0);
      
      const chartConfig = {
        type: 'line',
        data: {
          datasets: [{
            label: 'AAPL',
            data: chartPoints.slice(0, 10), // Use first 10 points for testing
            borderColor: '#8b5cf6',
            backgroundColor: '#1f2937',
            fill: false
          }]
        },
        options: {
          responsive: true,
          width: 800,
          height: 400,
          plugins: {
            title: {
              display: true,
              text: 'AAPL Chart (1d)',
              color: '#ffffff'
            }
          }
        }
      };
      
      const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
      const chartUrl = `https://quickchart.io/chart?c=${encodedConfig}`;
      
      console.log('✅ Chart image URL generated:');
      console.log(chartUrl);
      
    } else {
      console.log('❌ Chart API returned error:', data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function runTest() {
  console.log('🚀 Starting Chart API Test...\n');
  await testChartAPI();
  console.log('\n🎉 Test completed!');
}

runTest();
