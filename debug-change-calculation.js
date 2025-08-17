const https = require('https');
require('dotenv').config({ path: '.env.local' });

// Disable SSL certificate verification for local development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY;

async function testChangeCalculation(symbol) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const toDate = now.toISOString().split('T')[0];
    const fromDate = threeDaysAgo.toISOString().split('T')[0];
    
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?apikey=${POLYGON_API_KEY}`;
    
    console.log(`\n🔍 Testing change calculation for ${symbol}`);
    console.log(`URL: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`Status: ${res.statusCode}`);
          
          if (jsonData.status === 'OK' && jsonData.results && jsonData.results.length >= 2) {
            const latest = jsonData.results[jsonData.results.length - 1];
            const previous = jsonData.results[jsonData.results.length - 2];
            
            const currentPrice = latest.c;
            const previousPrice = previous.c;
            const change = currentPrice - previousPrice;
            const changePercent = (change / previousPrice) * 100;
            
            console.log(`✅ Change calculation successful:`);
            console.log(`  - Current Price: $${currentPrice}`);
            console.log(`  - Previous Price: $${previousPrice}`);
            console.log(`  - Change: $${change.toFixed(2)}`);
            console.log(`  - Change %: ${changePercent.toFixed(2)}%`);
            
            resolve({ success: true, change, changePercent });
          } else {
            console.log(`❌ Not enough data for change calculation`);
            console.log(`  - Results count: ${jsonData.results?.length || 0}`);
            resolve({ success: false, error: 'Not enough data' });
          }
        } catch (error) {
          console.log(`❌ JSON parsing error:`, error.message);
          resolve({ success: false, error: 'JSON parsing failed' });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Request error:`, error.message);
      reject(error);
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function debugChangeCalculation() {
  console.log('🔧 Debugging Change Calculation Logic...\n');
  console.log(`API Key: ${POLYGON_API_KEY ? 'Present' : 'Missing'}`);
  
  if (!POLYGON_API_KEY) {
    console.log('❌ No Polygon API key found in .env.local');
    return;
  }

  try {
    // Test with a few symbols
    const symbols = ['SPY', 'AAPL', 'MSFT'];
    
    for (const symbol of symbols) {
      await testChangeCalculation(symbol);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugChangeCalculation().catch(console.error);
