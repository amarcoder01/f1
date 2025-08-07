// Test script for improved search functionality
const { polygonAPI } = require('./src/lib/polygon-api.ts');

async function testImprovedSearch() {
  console.log('Testing improved search functionality...');
  
  try {
    // Test GOOGL search
    console.log('\n=== Testing GOOGL search ===');
    const googlResults = await polygonAPI.searchUSStocks('GOOGL');
    console.log(`GOOGL search returned ${googlResults.length} results:`);
    googlResults.forEach(stock => {
      console.log(`- ${stock.symbol}: ${stock.name} (${stock.exchange}) - $${stock.price}`);
    });
    
    // Test GOOG search
    console.log('\n=== Testing GOOG search ===');
    const googResults = await polygonAPI.searchUSStocks('GOOG');
    console.log(`GOOG search returned ${googResults.length} results:`);
    googResults.forEach(stock => {
      console.log(`- ${stock.symbol}: ${stock.name} (${stock.exchange}) - $${stock.price}`);
    });
    
    // Test Google search (partial match)
    console.log('\n=== Testing "Google" search ===');
    const googleResults = await polygonAPI.searchUSStocks('Google');
    console.log(`Google search returned ${googleResults.length} results:`);
    googleResults.forEach(stock => {
      console.log(`- ${stock.symbol}: ${stock.name} (${stock.exchange}) - $${stock.price}`);
    });
    
    // Test advanced search
    console.log('\n=== Testing advanced search for GOOGL ===');
    const advancedResults = await polygonAPI.advancedSearchUSStocks('GOOGL');
    console.log(`Advanced GOOGL search returned ${advancedResults.length} results:`);
    advancedResults.forEach(stock => {
      console.log(`- ${stock.symbol}: ${stock.name} (${stock.exchange}) - $${stock.price}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testImprovedSearch();