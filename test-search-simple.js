const WebSocket = require('ws');
require('dotenv').config({ path: '.env.local' });

// Simple test for Polygon API search
console.log('🧪 Simple Polygon API Search Test');
console.log('================================');

const API_KEY = process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY;

if (!API_KEY) {
  console.error('❌ No API key found');
  process.exit(1);
}

console.log('🔑 Using API key:', API_KEY.substring(0, 8) + '...');

async function testSearch() {
  try {
    // Test direct API call
    const searchUrl = `https://api.polygon.io/v3/reference/tickers?search=AAPL&market=stocks&active=true&limit=5&apikey=${API_KEY}`;
    console.log('🔍 Testing direct API search...');
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API call successful');
    console.log('📊 Status:', data.status);
    console.log('📊 Results found:', data.results?.length || 0);
    
    if (data.results && data.results.length > 0) {
      console.log('📊 First result:', {
        ticker: data.results[0].ticker,
        name: data.results[0].name,
        exchange: data.results[0].primary_exchange,
        type: data.results[0].type
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Search test failed:', error.message);
    return false;
  }
}

testSearch().then(success => {
  if (success) {
    console.log('\n🎉 Search functionality is working!');
    console.log('The issue might be in the Next.js API route.');
  } else {
    console.log('\n❌ Search functionality failed.');
  }
}); 