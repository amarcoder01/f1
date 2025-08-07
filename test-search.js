// Test script to debug search functionality
const { polygonAPI } = require('./src/lib/polygon-api.ts');

async function testSearch() {
  try {
    console.log('Testing search for GOOGL...');
    const results = await polygonAPI.searchUSStocks('GOOGL');
    console.log('GOOGL results:', results.length);
    results.forEach(stock => {
      console.log(`- ${stock.symbol}: ${stock.name}`);
    });
    
    console.log('\nTesting search for GOOG...');
    const googResults = await polygonAPI.searchUSStocks('GOOG');
    console.log('GOOG results:', googResults.length);
    googResults.forEach(stock => {
      console.log(`- ${stock.symbol}: ${stock.name}`);
    });
    
  } catch (error) {
    console.error('Error testing search:', error.message);
  }
}

testSearch();