const WebSocket = require('ws');
require('dotenv').config({ path: '.env.local' });

// Test Polygon.io $29 Starter Plan Connection
console.log('🧪 Testing Polygon.io $29 Starter Plan Connection');
console.log('==============================================');

// Get API key from environment
const API_KEY = process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY;

if (!API_KEY) {
  console.error('❌ No API key found in environment variables');
  console.error('Please create a .env.local file with:');
  console.error('POLYGON_API_KEY=your_actual_api_key_here');
  process.exit(1);
}

console.log('🔑 Using API key:', API_KEY.substring(0, 8) + '...');

// Test REST API endpoints
async function testRestAPI() {
  console.log('\n1. Testing REST API endpoints...');
  
  try {
    // Test ticker search
    const searchUrl = `https://api.polygon.io/v3/reference/tickers?search=AAPL&market=stocks&active=true&limit=5&apikey=${API_KEY}`;
    console.log('🔍 Testing ticker search...');
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.status} ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    console.log('✅ Ticker search successful');
    console.log(`📊 Found ${searchData.results?.length || 0} results`);
    
    // Test snapshot data
    const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/AAPL?apikey=${API_KEY}`;
    console.log('📈 Testing snapshot data...');
    
    const snapshotResponse = await fetch(snapshotUrl);
    if (!snapshotResponse.ok) {
      throw new Error(`Snapshot failed: ${snapshotResponse.status} ${snapshotResponse.statusText}`);
    }
    
    const snapshotData = await snapshotResponse.json();
    console.log('✅ Snapshot data successful');
    
    if (snapshotData.results && snapshotData.results.length > 0) {
      const stock = snapshotData.results[0].value;
      console.log(`📊 AAPL Price: $${stock.day?.c || stock.prevDay?.c || 'N/A'}`);
      console.log(`📊 Change: ${stock.todaysChange || 'N/A'}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ REST API test failed:', error.message);
    return false;
  }
}

// Test WebSocket connection
async function testWebSocket() {
  console.log('\n2. Testing WebSocket connection...');
  
  return new Promise((resolve) => {
    const ws = new WebSocket('wss://socket.polygon.io/stocks');
    let authenticated = false;
    let subscribed = false;
    
    ws.on('open', () => {
      console.log('✅ WebSocket connected');
      
      // Authenticate
      ws.send(JSON.stringify({
        action: 'auth',
        params: API_KEY
      }));
    });
    
    ws.on('message', (data) => {
      try {
        const messages = JSON.parse(data.toString());
        const messageArray = Array.isArray(messages) ? messages : [messages];
        
        for (const message of messageArray) {
          if (message.ev === 'status') {
            if (message.status === 'auth_success') {
              console.log('✅ WebSocket authentication successful');
              authenticated = true;
              
              // Subscribe to AAPL
              ws.send(JSON.stringify({
                action: 'subscribe',
                params: 'T.AAPL,AM.AAPL'
              }));
              
            } else if (message.status === 'auth_failed') {
              console.log('❌ WebSocket authentication failed');
              ws.close();
              resolve(false);
            }
          }
          
          if (message.ev === 'T' && !subscribed) {
            console.log(`📊 Received trade data for ${message.sym}: $${message.p}`);
            subscribed = true;
            
            // Wait a bit more for aggregate data
            setTimeout(() => {
              console.log('✅ WebSocket test completed successfully');
              ws.close();
              resolve(true);
            }, 2000);
          }
          
          if (message.ev === 'AM') {
            console.log(`📈 Received aggregate data for ${message.sym}: $${message.c}`);
          }
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      resolve(false);
    });
    
    ws.on('close', () => {
      if (!authenticated) {
        console.log('❌ WebSocket connection closed without authentication');
        resolve(false);
      }
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!authenticated) {
        console.log('⏱️ WebSocket test timed out');
        ws.close();
        resolve(false);
      }
    }, 10000);
  });
}

// Test search functionality
async function testSearch() {
  console.log('\n3. Testing search functionality...');
  
  try {
    // Test exact ticker search
    const searchUrl = `https://api.polygon.io/v3/reference/tickers?search=MSFT&market=stocks&active=true&limit=5&apikey=${API_KEY}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Search functionality working');
    console.log(`📊 Found ${data.results?.length || 0} results for MSFT`);
    
    if (data.results && data.results.length > 0) {
      const stock = data.results[0];
      console.log(`📊 Stock: ${stock.ticker} - ${stock.name}`);
      console.log(`📊 Exchange: ${stock.primary_exchange}`);
      console.log(`📊 Type: ${stock.type}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Search test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Polygon.io $29 Starter Plan tests...\n');
  
  const restTest = await testRestAPI();
  const wsTest = await testWebSocket();
  const searchTest = await testSearch();
  
  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`REST API: ${restTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`WebSocket: ${wsTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Search: ${searchTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (restTest && searchTest) {
    console.log('\n🎉 Your Polygon.io $29 Starter Plan is working correctly!');
    console.log('You can now use the search functionality in the Vidality app.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check:');
    console.log('1. Your API key is correct');
    console.log('2. Your subscription is active');
    console.log('3. Your internet connection');
    console.log('4. Check POLYGON_SETUP.md for setup instructions');
  }
  
  console.log('\n🔗 Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Go to http://localhost:3000/watchlist');
  console.log('3. Test the search functionality');
}

// Run the tests
runTests().catch(console.error); 