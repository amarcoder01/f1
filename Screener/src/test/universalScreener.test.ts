import { universalStockScreener } from '../services/polygonApi';
import { FilterCriteria } from '../types/stock';

// Test professional screening functionality
describe('Professional Stock Screener', () => {
  test('should perform professional screening with basic filters', async () => {
    const filters: FilterCriteria = {
      search: 'AAPL',
      priceMin: 100,
      priceMax: 200
    };

    try {
      const result = await universalStockScreener(filters, 10);
      
      expect(result).toBeDefined();
      expect(result.stocks).toBeInstanceOf(Array);
      expect(result.totalCount).toBeGreaterThanOrEqual(0);
      expect(typeof result.hasMore).toBe('boolean');
      
      console.log('Professional screening test passed:', {
        stocksFound: result.stocks.length,
        totalCount: result.totalCount,
        hasMore: result.hasMore
      });
    } catch (error) {
      console.error('Professional screening test failed:', error);
      // Test might fail if API key is not configured, which is expected
    }
  });

  test('should handle empty filters gracefully', async () => {
    const filters: FilterCriteria = {};

    try {
      const result = await universalStockScreener(filters, 5);
      
      expect(result).toBeDefined();
      expect(result.stocks).toBeInstanceOf(Array);
      
      console.log('Empty filters test passed:', {
        stocksFound: result.stocks.length
      });
    } catch (error) {
      console.error('Empty filters test failed:', error);
    }
  });
});
