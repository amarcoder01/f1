// Test script for multi-source stock data API
const testSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];

async function testMultiSourceAPI() {
  console.log('🧪 Testing Multi-Source Stock Data API...\n');

  for (const symbol of testSymbols) {
    try {
      console.log(`📡 Testing ${symbol}...`);
      
      // Test quote endpoint
      const quoteResponse = await fetch(`http://localhost:3000/api/stocks/quote?symbol=${symbol}`);
      const quoteData = await quoteResponse.json();
      
      if (quoteData.stock && quoteData.stock.price > 0) {
        console.log(`✅ ${symbol}: $${quoteData.stock.price} (${quoteData.stock.changePercent.toFixed(2)}%)`);
        console.log(`   Name: ${quoteData.stock.name}`);
        console.log(`   Exchange: ${quoteData.stock.exchange}`);
        console.log(`   Volume: ${quoteData.stock.volume.toLocaleString()}`);
      } else {
        console.log(`❌ ${symbol}: No data available`);
      }
      
    } catch (error) {
      console.log(`❌ ${symbol}: Error - ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  // Test search functionality
  console.log('🔍 Testing search functionality...');
  try {
    const searchResponse = await fetch('http://localhost:3000/api/stocks/search?q=AAPL');
    const searchData = await searchResponse.json();
    
    if (searchData.results && searchData.results.length > 0) {
      console.log(`✅ Search found ${searchData.results.length} results`);
      searchData.results.slice(0, 3).forEach((stock, index) => {
        console.log(`   ${index + 1}. ${stock.symbol}: $${stock.price} - ${stock.name}`);
      });
    } else {
      console.log('❌ Search returned no results');
    }
  } catch (error) {
    console.log(`❌ Search error: ${error.message}`);
  }
}

// Run the test
testMultiSourceAPI().catch(console.error);
