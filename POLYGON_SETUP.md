# Polygon.io $29 Starter Plan Setup Guide

## 🚀 Quick Setup for Vidality Trading Platform

### 1. Get Your Polygon.io API Key

1. **Sign up** at [https://polygon.io](https://polygon.io)
2. **Subscribe** to the **$29/month Starter Plan**
3. **Get your API key** from [https://polygon.io/dashboard](https://polygon.io/dashboard)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Polygon.io API Configuration for $29 Starter Plan
POLYGON_API_KEY=your_actual_api_key_here

# Alternative environment variable name (optional)
NEXT_PUBLIC_POLYGON_API_KEY=your_actual_api_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Vidality
NODE_ENV=development

# Feature Flags
NEXT_PUBLIC_ENABLE_REAL_API=true
NEXT_PUBLIC_ENABLE_AI_CHAT=true
```

### 3. $29 Starter Plan Features

✅ **What's Included:**
- **Real-time stock data** (no delay)
- **WebSocket connections** (up to 15 concurrent)
- **REST API access** with higher limits
- **US stock market data** (NYSE, NASDAQ, etc.)
- **Company information** and fundamentals
- **Historical data** access

✅ **API Limits:**
- **5 requests per minute** for most endpoints
- **15 WebSocket connections** maximum
- **Real-time data** (no delay)
- **Comprehensive US stock coverage**

### 4. Test Your Setup

Run the development server:

```bash
npm run dev
```

Then test the search functionality:

1. **Go to** `http://localhost:3000/watchlist`
2. **Search for** popular stocks like "AAPL", "MSFT", "TSLA"
3. **Check the console** for connection status

### 5. Troubleshooting

#### ❌ "API key not found" error
- Make sure your `.env.local` file exists
- Verify the API key is correct
- Restart the development server

#### ❌ "Authentication failed" error
- Check if your API key is valid
- Verify your subscription is active
- Try regenerating the API key

#### ❌ "Rate limit exceeded" error
- The $29 plan has 5 requests per minute limit
- Wait a moment and try again
- Consider upgrading for higher limits

#### ❌ Search not working
- Check browser console for errors
- Verify API key is properly configured
- Try searching for popular symbols first

### 6. WebSocket vs REST API

The application automatically uses:
- **WebSocket** for real-time updates (up to 15 symbols)
- **REST API** as fallback when WebSocket fails
- **Smart polling** to stay within rate limits

### 7. Performance Optimization

For the $29 plan, the app is optimized to:
- **Limit search results** to 8 stocks maximum
- **Add delays** between API calls
- **Cache data** to reduce API usage
- **Use efficient endpoints** to stay within limits

### 8. Next Steps

Once configured:
1. **Test search functionality** in the watchlist
2. **Add stocks** to your watchlist
3. **Monitor real-time updates**
4. **Explore the AI chat feature**

### 9. Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key and subscription status
3. Contact Polygon.io support if needed
4. Check the application logs for debugging info

---

**Happy Trading! 🚀** 