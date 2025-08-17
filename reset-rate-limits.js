// Reset rate limits and test API endpoints
const { enhancedPolygonMarketOverviewService } = require('./src/lib/polygon-market-overview-enhanced.ts');

async function resetAndTest() {
  console.log('🔄 Resetting rate limits...');
  
  // Reset rate limits
  enhancedPolygonMarketOverviewService.resetRateLimits();
  
  console.log('✅ Rate limits reset');
  console.log('📊 Rate limit info:', enhancedPolygonMarketOverviewService.getRateLimitInfo());
  
  // Test market status
  try {
    console.log('\n🧪 Testing market status...');
    const marketStatus = await enhancedPolygonMarketOverviewService.getMarketStatus();
    console.log('✅ Market status:', marketStatus);
  } catch (error) {
    console.error('❌ Market status error:', error.message);
  }
}

resetAndTest().catch(console.error);
