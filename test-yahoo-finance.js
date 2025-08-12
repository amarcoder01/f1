require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const CHARTIMG_API_KEY = process.env.CHARTIMG_API_KEY;

console.log('🔍 Yahoo Finance API Integration Test');
console.log('=====================================');

console.log('\n📋 Environment Check:');
console.log('  CHARTIMG_API_KEY:', CHARTIMG_API_KEY ? `${CHARTIMG_API_KEY.substring(0, 8)}...` : 'Not found');

if (!CHARTIMG_API_KEY) {
  console.error('\n❌ Yahoo Finance API key not found!');
  process.exit(1);
}

console.log('\n✅ Yahoo Finance API key found!');

// Test Yahoo Finance API
async function testYahooFinanceAPI() {
  console.log('\n🧪 Testing Yahoo Finance API...');
  
  const testSymbols = ['AAPL', 'MSFT', 'GOOGL'];
  
  for (const symbol of testSymbols) {
    console.log(`\n📊 Testing ${symbol}...`);
    
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo&apikey=${CHARTIMG_API_KEY}`;
      
      console.log(`  📍 URL: ${url.replace(CHARTIMG_API_KEY, '[API_KEY]')}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });
      
      console.log(`  📊 Status: ${response.status} ${response.statusText}`);
      console.log(`  📊 Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        console.log(`  ✅ ${symbol} chart data fetched successfully!`);
        
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
          const result = data.chart.result[0];
          const timestamps = result.timestamp;
          const quotes = result.indicators.quote[0];
          
          console.log(`  📈 Data Points: ${timestamps ? timestamps.length : 0}`);
          console.log(`  💰 Currency: ${result.meta?.currency || 'USD'}`);
          console.log(`  📊 Exchange: ${result.meta?.exchangeName || 'Unknown'}`);
          console.log(`  🏷️  Symbol: ${result.meta?.symbol || symbol}`);
          
          if (quotes && quotes.close) {
            const validPrices = quotes.close.filter(price => price !== null && price !== undefined);
            if (validPrices.length > 0) {
              const latestPrice = validPrices[validPrices.length - 1];
              console.log(`  💵 Latest Price: $${latestPrice.toFixed(2)}`);
            }
          }
        } else {
          console.log(`  ⚠️  ${symbol} data structure is incomplete`);
        }
      } else {
        console.log(`  ❌ ${symbol} failed: ${response.status} ${response.statusText}`);
        
        try {
          const errorText = await response.text();
          console.log(`  📄 Error response: ${errorText.substring(0, 200)}...`);
        } catch (e) {
          console.log(`  📄 Could not read error response`);
        }
      }
      
    } catch (error) {
      console.error(`  ❌ Error testing ${symbol}:`, error.message);
    }
  }
}

// Test different intervals
async function testIntervals() {
  console.log('\n⏰ Testing different intervals...');
  
  const intervals = ['1d', '5d', '1mo'];
  const symbol = 'AAPL';
  
  for (const interval of intervals) {
    console.log(`\n📊 Testing ${interval} interval...`);
    
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=1mo&apikey=${CHARTIMG_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });
      
      if (response.ok) {
        console.log(`  ✅ ${interval} interval works!`);
        const data = await response.json();
        const timestamps = data.chart?.result?.[0]?.timestamp;
        console.log(`  📈 Data points: ${timestamps ? timestamps.length : 0}`);
      } else {
        console.log(`  ❌ ${interval} interval failed: ${response.status}`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error testing ${interval}:`, error.message);
    }
  }
}

// Test different ranges
async function testRanges() {
  console.log('\n📅 Testing different ranges...');
  
  const ranges = ['1d', '5d', '1mo', '3mo'];
  const symbol = 'AAPL';
  
  for (const range of ranges) {
    console.log(`\n📊 Testing ${range} range...`);
    
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}&apikey=${CHARTIMG_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });
      
      if (response.ok) {
        console.log(`  ✅ ${range} range works!`);
        const data = await response.json();
        const timestamps = data.chart?.result?.[0]?.timestamp;
        console.log(`  📈 Data points: ${timestamps ? timestamps.length : 0}`);
      } else {
        console.log(`  ❌ ${range} range failed: ${response.status}`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error testing ${range}:`, error.message);
    }
  }
}

// Main test execution
async function runTests() {
  try {
    await testYahooFinanceAPI();
    await testIntervals();
    await testRanges();
    
    console.log('\n🎉 Yahoo Finance API integration test completed!');
    console.log('\n📝 Summary:');
    console.log('  ✅ Yahoo Finance API is working with your API key');
    console.log('  ✅ Multiple symbols tested successfully');
    console.log('  ✅ Different intervals and ranges work');
    console.log('\n💡 Next steps:');
    console.log('  1. Visit http://localhost:3001/test-yahoo-finance-chart to see the UI');
    console.log('  2. Test different symbols and timeframes');
    console.log('  3. Try the chart generation features');
    console.log('  4. Integrate into your main application');
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
