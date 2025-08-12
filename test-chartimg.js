require('dotenv').config({ path: '.env.local' });

const CHARTIMG_API_KEY = process.env.CHARTIMG_API_KEY || process.env.NEXT_PUBLIC_CHARTIMG_API_KEY;

console.log('🔍 ChartImg API Integration Test');
console.log('================================');

// Check environment variables
console.log('\n📋 Environment Check:');
console.log('  CHARTIMG_API_KEY:', CHARTIMG_API_KEY ? `${CHARTIMG_API_KEY.substring(0, 8)}...` : 'Not found');
console.log('  NEXT_PUBLIC_CHARTIMG_API_KEY:', process.env.NEXT_PUBLIC_CHARTIMG_API_KEY ? `${process.env.NEXT_PUBLIC_CHARTIMG_API_KEY.substring(0, 8)}...` : 'Not found');

if (!CHARTIMG_API_KEY) {
  console.error('\n❌ ChartImg API key not found!');
  console.error('Please add your ChartImg API key to your .env.local file:');
  console.error('  CHARTIMG_API_KEY=your_actual_api_key_here');
  process.exit(1);
}

console.log('\n✅ ChartImg API key found!');

// Test ChartImg API endpoints
async function testChartImgAPI() {
  console.log('\n🧪 Testing ChartImg API...');
  
  const testSymbols = ['AAPL', 'MSFT', 'GOOGL'];
  const baseUrl = 'http://localhost:3000/api/chartimg';
  
  for (const symbol of testSymbols) {
    console.log(`\n📊 Testing ${symbol} chart generation...`);
    
    try {
      // Test basic chart generation
      const basicUrl = `${baseUrl}/${symbol}?timeframe=1d&width=800&height=400&theme=dark&chartType=candlestick`;
      console.log(`  GET ${basicUrl}`);
      
      const basicResponse = await fetch(basicUrl);
      const basicResult = await basicResponse.json();
      
      if (basicResult.success) {
        console.log(`  ✅ ${symbol} basic chart generated successfully`);
        console.log(`  📍 Chart URL: ${basicResult.url.substring(0, 100)}...`);
      } else {
        console.log(`  ❌ ${symbol} basic chart failed:`, basicResult.error);
      }
      
      // Test chart with indicators
      const indicatorsUrl = `${baseUrl}/${symbol}?timeframe=1d&width=800&height=400&theme=dark&chartType=candlestick&indicators=sma,ema,rsi`;
      console.log(`  GET ${indicatorsUrl}`);
      
      const indicatorsResponse = await fetch(indicatorsUrl);
      const indicatorsResult = await indicatorsResponse.json();
      
      if (indicatorsResult.success) {
        console.log(`  ✅ ${symbol} chart with indicators generated successfully`);
        console.log(`  📍 Chart URL: ${indicatorsResult.url.substring(0, 100)}...`);
      } else {
        console.log(`  ❌ ${symbol} chart with indicators failed:`, indicatorsResult.error);
      }
      
      // Test POST request with custom options
      const postResponse = await fetch(`${baseUrl}/${symbol}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: '5d',
          width: 600,
          height: 300,
          theme: 'dark',
          chartType: 'line',
          indicators: ['sma', 'macd']
        })
      });
      
      const postResult = await postResponse.json();
      
      if (postResult.success) {
        console.log(`  ✅ ${symbol} POST chart generated successfully`);
        console.log(`  📍 Chart URL: ${postResult.url.substring(0, 100)}...`);
      } else {
        console.log(`  ❌ ${symbol} POST chart failed:`, postResult.error);
      }
      
    } catch (error) {
      console.error(`  ❌ Error testing ${symbol}:`, error.message);
    }
  }
}

// Test direct ChartImg API calls
async function testDirectChartImgAPI() {
  console.log('\n🔗 Testing direct ChartImg API calls...');
  
  const testSymbols = ['AAPL', 'MSFT'];
  
  for (const symbol of testSymbols) {
    console.log(`\n📊 Testing direct ${symbol} API call...`);
    
    try {
      // Test basic chart URL generation
      const chartUrl = `https://api.chartimg.com/chart?symbol=${symbol}&timeframe=1d&width=800&height=400&theme=dark&chartType=candlestick&apikey=${CHARTIMG_API_KEY}`;
      
      console.log(`  📍 Generated URL: ${chartUrl.replace(CHARTIMG_API_KEY, '[API_KEY]')}`);
      
      const response = await fetch(chartUrl);
      
      if (response.ok) {
        console.log(`  ✅ Direct ${symbol} chart API call successful`);
        console.log(`  📊 Response status: ${response.status}`);
        console.log(`  📊 Content-Type: ${response.headers.get('content-type')}`);
      } else {
        console.log(`  ❌ Direct ${symbol} chart API call failed:`, response.status, response.statusText);
      }
      
    } catch (error) {
      console.error(`  ❌ Error testing direct ${symbol} API:`, error.message);
    }
  }
}

// Test different chart types and timeframes
async function testChartVariations() {
  console.log('\n🎨 Testing chart variations...');
  
  const variations = [
    { timeframe: '1d', chartType: 'candlestick', indicators: ['sma', 'ema'] },
    { timeframe: '5d', chartType: 'line', indicators: ['rsi'] },
    { timeframe: '1mo', chartType: 'area', indicators: ['macd'] },
    { timeframe: '1h', chartType: 'bar', indicators: ['volume'] }
  ];
  
  for (const variation of variations) {
    console.log(`\n📊 Testing ${variation.timeframe} ${variation.chartType} with ${variation.indicators.join(', ')}...`);
    
    try {
      const url = `http://localhost:3000/api/chartimg/AAPL?timeframe=${variation.timeframe}&chartType=${variation.chartType}&indicators=${variation.indicators.join(',')}&width=600&height=300`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        console.log(`  ✅ ${variation.timeframe} ${variation.chartType} chart generated successfully`);
      } else {
        console.log(`  ❌ ${variation.timeframe} ${variation.chartType} chart failed:`, result.error);
      }
      
    } catch (error) {
      console.error(`  ❌ Error testing variation:`, error.message);
    }
  }
}

// Main test execution
async function runTests() {
  try {
    await testChartImgAPI();
    await testDirectChartImgAPI();
    await testChartVariations();
    
    console.log('\n🎉 ChartImg API integration test completed!');
    console.log('\n📝 Next steps:');
    console.log('  1. Visit http://localhost:3000/test-chartimg to see the UI');
    console.log('  2. Test different symbols and timeframes');
    console.log('  3. Try adding technical indicators');
    console.log('  4. Check chart download functionality');
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testChartImgAPI, testDirectChartImgAPI, testChartVariations };
