// Test Polygon API endpoints directly
// Using native fetch API (Node.js 18+)
require('dotenv').config();

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || process.env.POLYGON_API_KEY;
const POLYGON_BASE_URL = 'https://api.polygon.io';

if (!POLYGON_API_KEY) {
  console.error('❌ No API key found in environment variables!');
  console.error('NEXT_PUBLIC_POLYGON_API_KEY:', process.env.NEXT_PUBLIC_POLYGON_API_KEY);
  console.error('POLYGON_API_KEY:', process.env.POLYGON_API_KEY);
  process.exit(1);
}

async function makeAuthenticatedRequest(url) {
  const response = await fetch(`${url}?apikey=${POLYGON_API_KEY}`);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
}

async function testMSFTSearch() {
  console.log('Testing MSFT search...');
  
  try {
    // Test 0: Try a simple endpoint first (market status - often available on free tier)
    console.log('\n0. Testing market status endpoint...');
    const statusUrl = `${POLYGON_BASE_URL}/v1/marketstatus/now`;
    console.log('URL:', statusUrl);
    
    try {
      const statusResponse = await makeAuthenticatedRequest(statusUrl);
      const statusData = await statusResponse.json();
      console.log('Market status:', JSON.stringify(statusData, null, 2));
    } catch (error) {
      console.log('Market status failed:', error.message);
    }
    
    // Test 1: Search for MSFT using ticker search
    console.log('\n1. Testing ticker search for MSFT...');
    const searchUrl = `${POLYGON_BASE_URL}/v3/reference/tickers?search=MSFT&market=stocks&active=true&limit=20`;
    console.log('URL:', searchUrl);
    
    const searchResponse = await makeAuthenticatedRequest(searchUrl);
    const searchData = await searchResponse.json();
    
    console.log('Search results:', JSON.stringify(searchData, null, 2));
    
    // Test 2: Direct ticker lookup for MSFT
    console.log('\n2. Testing direct ticker lookup for MSFT...');
    const tickerUrl = `${POLYGON_BASE_URL}/v3/reference/tickers/MSFT`;
    console.log('URL:', tickerUrl);
    
    const tickerResponse = await makeAuthenticatedRequest(tickerUrl);
    const tickerData = await tickerResponse.json();
    
    console.log('Ticker details:', JSON.stringify(tickerData, null, 2));
    
    // Test 3: Get snapshot data for MSFT
    console.log('\n3. Testing snapshot data for MSFT...');
    const snapshotUrl = `${POLYGON_BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/MSFT`;
    console.log('URL:', snapshotUrl);
    
    const snapshotResponse = await makeAuthenticatedRequest(snapshotUrl);
    const snapshotData = await snapshotResponse.json();
    
    console.log('Snapshot data:', JSON.stringify(snapshotData, null, 2));
    
  } catch (error) {
    console.error('Error testing MSFT search:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

async function testOtherStocks() {
  console.log('\n\nTesting other popular stocks...');
  
  const stocks = ['AAPL', 'GOOGL', 'TSLA'];
  
  for (const stock of stocks) {
    try {
      console.log(`\nTesting ${stock}...`);
      const searchUrl = `${POLYGON_BASE_URL}/v3/reference/tickers?search=${stock}&market=stocks&active=true&limit=5`;
      
      const response = await makeAuthenticatedRequest(searchUrl);
      const data = await response.json();
      
      console.log(`${stock} results:`, data.results?.length || 0, 'found');
      if (data.results && data.results.length > 0) {
        console.log('First result:', {
          ticker: data.results[0].ticker,
          name: data.results[0].name,
          type: data.results[0].type,
          exchange: data.results[0].primary_exchange,
          active: data.results[0].active
        });
      }
    } catch (error) {
      console.error(`Error testing ${stock}:`, error.message);
    }
  }
}

async function main() {
  console.log('Starting Polygon API tests...');
  console.log('API Key:', POLYGON_API_KEY.substring(0, 10) + '...');
  
  await testMSFTSearch();
  await testOtherStocks();
  
  console.log('\nTests completed.');
}

main().catch(console.error);