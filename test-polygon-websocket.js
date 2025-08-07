const WebSocket = require('ws');
require('dotenv').config();

// Test the Polygon WebSocket implementation directly
console.log('🧪 Testing Polygon WebSocket Implementation');
console.log('=====================================');

// Get API key from environment
const API_KEY = process.env.POLYGON_SECRET_ACCESS_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY;

if (!API_KEY) {
  console.error('❌ No API key found in environment variables');
  process.exit(1);
}

console.log('🔑 Using API key:', API_KEY.substring(0, 8) + '...');

// Test WebSocket connection with fallback
async function testWebSocketWithFallback() {
  console.log('\n1. Testing real-time WebSocket connection...');
  
  return new Promise((resolve) => {
    const realTimeWs = new WebSocket('wss://socket.polygon.io/stocks');
    let authenticationTested = false;
    let subscriptionTested = false;
    
    realTimeWs.on('open', () => {
      console.log('✅ Connected to real-time WebSocket');
      
      // Authenticate
      realTimeWs.send(JSON.stringify({
        action: 'auth',
        params: API_KEY
      }));
    });
    
    realTimeWs.on('message', (data) => {
      try {
        const messages = JSON.parse(data.toString());
        const messageArray = Array.isArray(messages) ? messages : [messages];
        
        for (const message of messageArray) {
          console.log('📨 Received message:', message);
          
          // Handle authentication success
          if (message.ev === 'status' && message.status === 'auth_success') {
            console.log('✅ Real-time authentication successful!');
            authenticationTested = true;
            
            // Subscribe to test symbols
            console.log('📊 Subscribing to AAPL and MSFT...');
            realTimeWs.send(JSON.stringify({
              action: 'subscribe',
              params: 'AM.AAPL,AM.MSFT'
            }));
            
            realTimeWs.send(JSON.stringify({
              action: 'subscribe',
              params: 'T.AAPL,T.MSFT'
            }));
            
            subscriptionTested = true;
            
            // Wait for data for 10 seconds
            setTimeout(() => {
              console.log('✅ Real-time WebSocket test completed');
              realTimeWs.close();
              resolve('real-time');
            }, 10000);
          }
          
          // Handle authentication failure
          if (message.ev === 'status' && message.status === 'auth_failed') {
            console.log('❌ Real-time authentication failed');
            realTimeWs.close();
            testDelayedWebSocket().then(() => resolve('delayed'));
          }
          
          // Handle subscription errors
          if (message.ev === 'status' && message.status === 'error') {
            console.log('⚠️ Real-time subscription error:', message.message);
            
            if (message.message && message.message.includes('real-time')) {
              console.log('🔄 Switching to delayed endpoint...');
              realTimeWs.close();
              testDelayedWebSocket().then(() => resolve('delayed'));
            }
          }
          
          // Handle data messages
          if (message.ev === 'AM') {
            console.log(`📊 Real-time aggregate data for ${message.sym}: $${message.c}`);
          }
          
          if (message.ev === 'T') {
            console.log(`📈 Real-time trade data for ${message.sym}: $${message.p}`);
          }
        }
      } catch (error) {
        console.error('❌ Error parsing message:', error);
      }
    });
    
    realTimeWs.on('error', (error) => {
      console.error('❌ Real-time WebSocket error:', error);
    });
    
    realTimeWs.on('close', (code, reason) => {
      console.log(`🔌 Real-time WebSocket closed: ${code} ${reason}`);
      if (!authenticationTested && !subscriptionTested) {
        console.log('🔄 Testing delayed endpoint...');
        testDelayedWebSocket().then(() => resolve('delayed'));
      }
    });
  });
}

// Test delayed WebSocket connection
async function testDelayedWebSocket() {
  console.log('\n2. Testing delayed WebSocket connection...');
  
  return new Promise((resolve) => {
    const delayedWs = new WebSocket('wss://delayed.polygon.io/stocks');
    
    delayedWs.on('open', () => {
      console.log('✅ Connected to delayed WebSocket');
      
      // Authenticate
      delayedWs.send(JSON.stringify({
        action: 'auth',
        params: API_KEY
      }));
    });
    
    delayedWs.on('message', (data) => {
      try {
        const messages = JSON.parse(data.toString());
        const messageArray = Array.isArray(messages) ? messages : [messages];
        
        for (const message of messageArray) {
          console.log('📨 Received delayed message:', message);
          
          // Handle authentication success
          if (message.ev === 'status' && message.status === 'auth_success') {
            console.log('✅ Delayed authentication successful!');
            
            // Subscribe to test symbols
            console.log('📊 Subscribing to delayed AAPL and MSFT...');
            delayedWs.send(JSON.stringify({
              action: 'subscribe',
              params: 'AM.AAPL,AM.MSFT'
            }));
            
            delayedWs.send(JSON.stringify({
              action: 'subscribe',
              params: 'T.AAPL,T.MSFT'
            }));
            
            // Wait for data for 10 seconds
            setTimeout(() => {
              console.log('✅ Delayed WebSocket test completed');
              delayedWs.close();
              resolve('delayed');
            }, 10000);
          }
          
          // Handle data messages
          if (message.ev === 'AM') {
            console.log(`📊 Delayed aggregate data for ${message.sym}: $${message.c}`);
          }
          
          if (message.ev === 'T') {
            console.log(`📈 Delayed trade data for ${message.sym}: $${message.p}`);
          }
        }
      } catch (error) {
        console.error('❌ Error parsing delayed message:', error);
      }
    });
    
    delayedWs.on('error', (error) => {
      console.error('❌ Delayed WebSocket error:', error);
    });
    
    delayedWs.on('close', (code, reason) => {
      console.log(`🔌 Delayed WebSocket closed: ${code} ${reason}`);
      resolve('delayed');
    });
  });
}

// Run the test
testWebSocketWithFallback().then((result) => {
  console.log(`\n✅ WebSocket test completed using ${result} endpoint`);
  console.log('=====================================');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});