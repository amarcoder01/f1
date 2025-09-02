const fetch = require('node-fetch');

async function testTopMoversAPI() {
  console.log('Testing Top Movers API...\n');
  
  try {
    // Test gainers endpoint
    console.log('1. Testing gainers endpoint...');
    const gainersResponse = await fetch('http://localhost:3000/api/market/top-movers?type=gainers');
    const gainersData = await gainersResponse.json();
    
    console.log('Gainers Response Status:', gainersResponse.status);
    console.log('Gainers Data:', JSON.stringify(gainersData, null, 2));
    
    // Test losers endpoint
    console.log('\n2. Testing losers endpoint...');
    const losersResponse = await fetch('http://localhost:3000/api/market/top-movers?type=losers');
    const losersData = await losersResponse.json();
    
    console.log('Losers Response Status:', losersResponse.status);
    console.log('Losers Data:', JSON.stringify(losersData, null, 2));
    
    // Test market status endpoint
    console.log('\n3. Testing market status endpoint...');
    const statusResponse = await fetch('http://localhost:3000/api/market/status');
    const statusData = await statusResponse.json();
    
    console.log('Status Response Status:', statusResponse.status);
    console.log('Status Data:', JSON.stringify(statusData, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testTopMoversAPI();
