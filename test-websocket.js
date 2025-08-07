// Test script for Polygon.io WebSocket real-time connection
// This script tests the paid plan WebSocket functionality

const WebSocket = require('ws');
require('dotenv').config();

// Try different API keys from environment
const API_KEY = process.env.POLYGON_SECRET_ACCESS_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY;

console.log('🔍 Available API keys:');
console.log('  POLYGON_API_KEY:', process.env.POLYGON_API_KEY ? `${process.env.POLYGON_API_KEY.substring(0, 8)}...` : 'Not found');
console.log('  NEXT_PUBLIC_POLYGON_API_KEY:', process.env.NEXT_PUBLIC_POLYGON_API_KEY ? `${process.env.NEXT_PUBLIC_POLYGON_API_KEY.substring(0, 8)}...` : 'Not found');
console.log('  POLYGON_SECRET_ACCESS_KEY:', process.env.POLYGON_SECRET_ACCESS_KEY ? `${process.env.POLYGON_SECRET_ACCESS_KEY.substring(0, 8)}...` : 'Not found');
const WS_URL = 'wss://socket.polygon.io/stocks';

if (!API_KEY) {
  console.error('❌ API key not found in environment variables');
  process.exit(1);
}

console.log('🚀 Testing Polygon.io WebSocket connection...');
console.log(`📡 Connecting to: ${WS_URL}`);
console.log(`🔑 Using API key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✅ WebSocket connection established');
  
  // Send authentication
  const authMessage = {
    action: 'auth',
    params: API_KEY
  };
  
  console.log('🔐 Sending authentication...');
  ws.send(JSON.stringify(authMessage));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📨 Received message:', JSON.stringify(message, null, 2));
    
    // Handle authentication response
    if (message[0]?.ev === 'status' && message[0]?.status === 'auth_success') {
      console.log('🎉 Authentication successful! Premium tier confirmed.');
      
      // Subscribe to test symbols
      const subscribeMessage = {
        action: 'subscribe',
        params: 'AM.AAPL,AM.MSFT,T.AAPL,T.MSFT'
      };
      
      console.log('📊 Subscribing to test symbols (AAPL, MSFT)...');
      ws.send(JSON.stringify(subscribeMessage));
      
      // Set timeout to close connection after 30 seconds
      setTimeout(() => {
        console.log('⏰ Test completed. Closing connection...');
        ws.close();
      }, 30000);
    }
    
    // Handle authentication failure
    if (message[0]?.ev === 'status' && message[0]?.status === 'auth_failed') {
      console.error('❌ Authentication failed! Check your API key or subscription tier.');
      ws.close();
    }
    
    // Handle real-time data
    if (message[0]?.ev === 'AM') {
      const data = message[0];
      console.log(`📊 Aggregate data for ${data.sym}: Open=$${data.o}, Close=$${data.c}, Volume=${data.v}`);
    }
    
    if (message[0]?.ev === 'T') {
      const data = message[0];
      console.log(`📈 Trade data for ${data.sym}: Price=$${data.p}, Size=${data.s}`);
    }
    
  } catch (error) {
    console.error('❌ Error parsing message:', error);
  }
});

ws.on('close', (code, reason) => {
  console.log(`🔌 WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Terminating test...');
  ws.close();
  process.exit(0);
});

console.log('⏳ Waiting for connection... (Press Ctrl+C to exit)');