// Test script to verify search functionality with updated API key
const { PolygonStockAPI } = require('./src/lib/polygon-api.ts');

async function testSearchFunctionality() {
  console.log('🧪 Testing search functionality with updated configuration...');
  
  try {
    const polygonAPI = PolygonStockAPI.getInstance();
    
    // Test searches for stocks that were previously failing
    const testQueries = ['GOOG', 'GOOGL', 'AAPL', 'MSFT', 'TSLA'];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing search for: ${query}`);
      
      try {
        const results = await polygonAPI.searchUSStocks(query);
        console.log(`✅ Found ${results.length} results for ${query}:`);
        
        results.forEach((stock, index) => {
          console.log(`  ${index + 1}. ${stock.symbol} - ${stock.name} ($${stock.price})`);
        });
        
        if (results.length === 0) {
          console.log(`⚠️  No results found for ${query}`);
        }
      } catch (error) {
        console.error(`❌ Error searching for ${query}:`, error.message);
      }
    }
    
    console.log('\n🧪 Testing advanced search...');
    
    try {
      const advancedResults = await polygonAPI.advancedSearchUSStocks('Google');
      console.log(`✅ Advanced search for 'Google' found ${advancedResults.length} results:`);
      
      advancedResults.forEach((stock, index) => {
        console.log(`  ${index + 1}. ${stock.symbol} - ${stock.name} ($${stock.price})`);
      });
    } catch (error) {
      console.error('❌ Error in advanced search:', error.message);
    }
    
    console.log('\n✅ Search functionality test completed!');
    
  } catch (error) {
    console.error('❌ Failed to test search functionality:', error);
  }
}

// Run the test
testSearchFunctionality().catch(console.error);