require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const CHARTIMG_API_KEY = process.env.CHARTIMG_API_KEY;

console.log('🔍 Financial Charting API Research & Test');
console.log('==========================================');

console.log('\n📋 Environment Check:');
console.log('  CHARTIMG_API_KEY:', CHARTIMG_API_KEY ? `${CHARTIMG_API_KEY.substring(0, 8)}...` : 'Not found');

if (!CHARTIMG_API_KEY) {
  console.error('\n❌ ChartImg API key not found!');
  process.exit(1);
}

console.log('\n✅ ChartImg API key found!');

// Test various financial charting services
async function testFinancialChartingServices() {
  console.log('\n🧪 Testing Financial Charting Services...');
  
  const testSymbols = ['AAPL', 'MSFT'];
  
  // Common financial charting services
  const services = [
    {
      name: 'Alpha Vantage',
      baseUrl: 'https://www.alphavantage.co/query',
      params: (symbol, key) => `function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${key}&outputsize=compact`
    },
    {
      name: 'Yahoo Finance API',
      baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
      params: (symbol, key) => `${symbol}?interval=1d&range=1mo&apikey=${key}`
    },
    {
      name: 'IEX Cloud',
      baseUrl: 'https://cloud.iexapis.com/stable/stock',
      params: (symbol, key) => `${symbol}/chart/1m?token=${key}`
    },
    {
      name: 'Finnhub',
      baseUrl: 'https://finnhub.io/api/v1/quote',
      params: (symbol, key) => `?symbol=${symbol}&token=${key}`
    },
    {
      name: 'Polygon.io',
      baseUrl: 'https://api.polygon.io/v2/aggs/ticker',
      params: (symbol, key) => `${symbol}/range/1/day/2024-01-01/2024-12-31?apiKey=${key}`
    },
    {
      name: 'MarketStack',
      baseUrl: 'http://api.marketstack.com/v1/eod',
      params: (symbol, key) => `?access_key=${key}&symbols=${symbol}&date_from=2024-01-01&date_to=2024-12-31`
    },
    {
      name: 'Twelve Data',
      baseUrl: 'https://api.twelvedata.com/time_series',
      params: (symbol, key) => `?symbol=${symbol}&interval=1day&apikey=${key}`
    },
    {
      name: 'Quandl',
      baseUrl: 'https://www.quandl.com/api/v3/datasets',
      params: (symbol, key) => `WIKI/${symbol}/data.json?api_key=${key}`
    },
    {
      name: 'ChartImg Alternative',
      baseUrl: 'https://chartimg.com/api/v1',
      params: (symbol, key) => `chart?symbol=${symbol}&timeframe=1d&apikey=${key}`
    },
    {
      name: 'ChartImg Direct',
      baseUrl: 'https://chartimg.com',
      params: (symbol, key) => `?symbol=${symbol}&timeframe=1d&apikey=${key}`
    }
  ];
  
  for (const service of services) {
    console.log(`\n🔗 Testing ${service.name}...`);
    
    for (const symbol of testSymbols) {
      console.log(`  📊 Testing ${symbol}...`);
      
      try {
        const url = `${service.baseUrl}/${service.params(symbol, CHARTIMG_API_KEY)}`;
        console.log(`    📍 URL: ${url.replace(CHARTIMG_API_KEY, '[API_KEY]')}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json,image/png,image/jpeg,image/webp,*/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 15000
        });
        
        console.log(`    📊 Status: ${response.status} ${response.statusText}`);
        console.log(`    📊 Content-Type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
          console.log(`    ✅ ${service.name} ${symbol} successful!`);
          
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.startsWith('image/')) {
            console.log(`    🖼️  Image received: ${contentType}`);
            
            // Save the image
            const fs = require('fs');
            const buffer = await response.buffer();
            const filename = `test-${service.name.toLowerCase().replace(/\s+/g, '-')}-${symbol}.png`;
            fs.writeFileSync(filename, buffer);
            console.log(`    💾 Chart saved as ${filename}`);
          } else if (contentType && contentType.includes('json')) {
            console.log(`    📄 JSON response received`);
            try {
              const json = await response.json();
              console.log(`    📊 Response keys: ${Object.keys(json).join(', ')}`);
              
              // Check if it's financial data
              if (json['Time Series (Daily)'] || json.chart || json.quote || json.data) {
                console.log(`    ✅ Financial data confirmed!`);
              }
            } catch (e) {
              console.log(`    📄 Could not parse JSON`);
            }
          } else {
            console.log(`    📄 Other response type: ${contentType}`);
          }
        } else {
          console.log(`    ❌ ${service.name} ${symbol} failed: ${response.status}`);
          
          if (response.status === 401) {
            console.log(`    🔑 Authentication failed - API key might be invalid`);
          } else if (response.status === 403) {
            console.log(`    🚫 Access forbidden - API key might be for different service`);
          } else if (response.status === 404) {
            console.log(`    📄 Endpoint not found`);
          }
          
          try {
            const errorText = await response.text();
            console.log(`    📄 Error response: ${errorText.substring(0, 200)}...`);
          } catch (e) {
            console.log(`    📄 Could not read error response`);
          }
        }
        
      } catch (error) {
        console.log(`    ❌ Error testing ${service.name} ${symbol}: ${error.message}`);
        
        if (error.code === 'ENOTFOUND') {
          console.log(`    📄 Domain not found`);
        } else if (error.code === 'ECONNREFUSED') {
          console.log(`    📄 Connection refused`);
        } else if (error.code === 'ETIMEDOUT') {
          console.log(`    📄 Request timed out`);
        }
      }
    }
  }
}

// Test with different API key parameter names
async function testApiKeyParameters() {
  console.log('\n🔑 Testing API Key Parameters...');
  
  const keyParams = [
    'apikey', 'key', 'api_key', 'token', 'access_key', 'auth', 'authorization'
  ];
  
  const testServices = [
    {
      name: 'Alpha Vantage',
      baseUrl: 'https://www.alphavantage.co/query',
      symbol: 'AAPL',
      function: 'TIME_SERIES_DAILY'
    },
    {
      name: 'Yahoo Finance',
      baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
      symbol: 'AAPL',
      interval: '1d'
    },
    {
      name: 'IEX Cloud',
      baseUrl: 'https://cloud.iexapis.com/stable/stock',
      symbol: 'AAPL',
      endpoint: 'quote'
    }
  ];
  
  for (const service of testServices) {
    console.log(`\n🔗 Testing ${service.name} with different key parameters...`);
    
    for (const keyParam of keyParams) {
      try {
        let url;
        if (service.name === 'Alpha Vantage') {
          url = `${service.baseUrl}?function=${service.function}&symbol=${service.symbol}&${keyParam}=${CHARTIMG_API_KEY}`;
        } else if (service.name === 'Yahoo Finance') {
          url = `${service.baseUrl}/${service.symbol}?interval=${service.interval}&${keyParam}=${CHARTIMG_API_KEY}`;
        } else if (service.name === 'IEX Cloud') {
          url = `${service.baseUrl}/${service.symbol}/${service.endpoint}?${keyParam}=${CHARTIMG_API_KEY}`;
        }
        
        console.log(`  📍 Testing ${keyParam}: ${url.replace(CHARTIMG_API_KEY, '[API_KEY]')}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json,*/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });
        
        if (response.ok) {
          console.log(`    ✅ ${keyParam} works for ${service.name}!`);
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('json')) {
            console.log(`    📄 JSON response received`);
          }
        } else {
          console.log(`    ❌ ${keyParam} failed: ${response.status}`);
        }
        
      } catch (error) {
        console.log(`    ❌ Error with ${keyParam}: ${error.message}`);
      }
    }
  }
}

// Test the API key format to identify the service
async function identifyApiKeyService() {
  console.log('\n🔍 Identifying API Key Service...');
  
  // Common API key patterns
  const patterns = [
    { name: 'Alpha Vantage', pattern: /^[A-Z0-9]{16}$/ },
    { name: 'IEX Cloud', pattern: /^pk_[a-zA-Z0-9]{32}$/ },
    { name: 'Finnhub', pattern: /^[a-zA-Z0-9]{20}$/ },
    { name: 'Polygon.io', pattern: /^[A-Za-z0-9]{20,}$/ },
    { name: 'MarketStack', pattern: /^[a-zA-Z0-9]{32}$/ },
    { name: 'Twelve Data', pattern: /^[a-zA-Z0-9]{32}$/ },
    { name: 'Quandl', pattern: /^[a-zA-Z0-9]{16,}$/ },
    { name: 'ChartImg', pattern: /^[a-zA-Z0-9]{32,}$/ }
  ];
  
  console.log(`\n🔑 API Key Analysis:`);
  console.log(`  Length: ${CHARTIMG_API_KEY.length} characters`);
  console.log(`  Format: ${CHARTIMG_API_KEY.substring(0, 8)}...`);
  console.log(`  Contains only alphanumeric: ${/^[a-zA-Z0-9]+$/.test(CHARTIMG_API_KEY)}`);
  
  for (const pattern of patterns) {
    if (pattern.pattern.test(CHARTIMG_API_KEY)) {
      console.log(`  ✅ Matches ${pattern.name} pattern`);
    } else {
      console.log(`  ❌ Does not match ${pattern.name} pattern`);
    }
  }
}

// Main test execution
async function runTests() {
  try {
    await identifyApiKeyService();
    await testFinancialChartingServices();
    await testApiKeyParameters();
    
    console.log('\n🎉 Financial Charting API research completed!');
    console.log('\n📝 Summary:');
    console.log('  - Identified API key format and potential services');
    console.log('  - Tested multiple financial charting APIs');
    console.log('  - Tested different API key parameter formats');
    console.log('\n💡 Next steps:');
    console.log('  1. Check which service responded successfully');
    console.log('  2. Update the ChartImg API integration with the correct service');
    console.log('  3. Implement the working charting service');
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
