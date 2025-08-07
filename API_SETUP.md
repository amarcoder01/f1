# 🔗 Real Stock Data API Setup for Vidality

This guide explains how to integrate real stock market data APIs with your Vidality trading platform.

## 🚀 Quick Setup

### 1. Create Environment File

Create a `.env.local` file in your project root:

```bash
# Real-time Stock Data APIs for Vidality

# IEX Cloud API (Recommended - Most comprehensive)
NEXT_PUBLIC_IEX_API_KEY=your_iex_api_key_here

# Finnhub API (Good alternative)
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key_here

# Alpha Vantage API (Basic data)
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Enable real API usage
NEXT_PUBLIC_ENABLE_REAL_API=true

# App Configuration
NEXT_PUBLIC_APP_NAME=Vidality
NODE_ENV=development
```

### 2. Get API Keys (Free Options)

#### 🏆 **IEX Cloud (Recommended)**
- **Free Tier**: 50,000 requests/month
- **Features**: Real-time quotes, company info, comprehensive data
- **Sign up**: https://iexcloud.io/
- **Best for**: Production use, comprehensive data

#### 🥈 **Finnhub (Alternative)**
- **Free Tier**: 60 calls/minute
- **Features**: Real-time quotes, company profiles
- **Sign up**: https://finnhub.io/
- **Best for**: Real-time quotes with company info

#### 🥉 **Alpha Vantage (Basic)**
- **Free Tier**: 25 requests/day
- **Features**: Basic quotes and historical data
- **Sign up**: https://www.alphavantage.co/
- **Best for**: Development and testing

### 3. Enable Real Data

Set `NEXT_PUBLIC_ENABLE_REAL_API=true` in your `.env.local` file.

## 📊 API Features

### Current Implementation

✅ **Real-time Stock Quotes**
- Current price, change, volume
- Day high/low, 52-week range
- Market cap, P/E ratio

✅ **Company Information**
- Company name and sector
- Exchange information (NYSE/NASDAQ)
- Industry classification

✅ **Smart Fallback System**
- Tries multiple APIs in order
- Falls back to mock data if APIs fail
- Caching to prevent rate limit issues

✅ **Search Functionality**
- Search by stock symbol
- Search by company name
- Real-time search results

### API Priority Order

1. **IEX Cloud** (Most comprehensive)
2. **Finnhub** (Good alternative)
3. **Alpha Vantage** (Basic fallback)
4. **Mock Data** (Development fallback)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_IEX_API_KEY` | IEX Cloud API key | Recommended |
| `NEXT_PUBLIC_FINNHUB_API_KEY` | Finnhub API key | Optional |
| `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY` | Alpha Vantage key | Optional |
| `NEXT_PUBLIC_ENABLE_REAL_API` | Enable real APIs (true/false) | Yes |

### API Rate Limits

| Provider | Free Limit | Cached For |
|----------|------------|------------|
| IEX Cloud | 50,000/month | 1 minute |
| Finnhub | 60/minute | 1 minute |
| Alpha Vantage | 25/day | 1 minute |

## 🧪 Testing

### 1. Check API Status

Open browser console (F12) and look for:
```
Fetching real data for AAPL
Searching real stocks for Apple
```

### 2. Test Search

Try searching for:
- `AAPL` (Apple)
- `MSFT` (Microsoft)  
- `GOOGL` (Google)
- `Tesla` (by name)

### 3. Monitor Rate Limits

Watch console for API errors if you hit rate limits.

## 🚨 Troubleshooting

### Mock Data Still Showing?

1. Check `.env.local` file exists
2. Verify `NEXT_PUBLIC_ENABLE_REAL_API=true`
3. Ensure at least one API key is set
4. Restart development server: `npm run dev`

### API Errors?

1. **Rate Limit**: Wait and try again
2. **Invalid Symbol**: Try popular stocks (AAPL, MSFT)
3. **Network Error**: Check internet connection
4. **Invalid API Key**: Verify key in your provider dashboard

### No Search Results?

1. Check console for API error messages
2. Try exact stock symbols (AAPL vs Apple Inc)
3. Verify API key has permissions
4. Check API usage limits in provider dashboard

## 📈 Supported Stocks

### Popular Symbols Available
- **Tech**: AAPL, MSFT, GOOGL, META, NVDA, AMZN
- **Finance**: JPM, BAC, V, MA, WFC
- **Healthcare**: JNJ, PFE, UNH, ABBV
- **Consumer**: WMT, HD, MCD, KO, PG
- **And many more US-listed stocks**

## 🔄 Development vs Production

### Development Mode
- Uses mock data by default
- No API keys required
- Simulated real-time updates
- All features work offline

### Production Mode
- Requires real API keys
- Live market data
- Actual company information
- Real-time price updates

## 💡 Tips

1. **Start with IEX Cloud** - Best free tier
2. **Monitor Usage** - Track API calls in provider dashboard
3. **Cache Strategy** - App caches for 1 minute to save API calls
4. **Multiple Keys** - Set up multiple providers for redundancy
5. **Rate Limiting** - APIs automatically fallback if limits hit

## 🛠️ Adding More Providers

To add additional stock data providers:

1. Update `src/lib/real-stock-api.ts`
2. Add new provider method
3. Update fallback chain in `getRealStock()`
4. Add environment variables
5. Test with your API keys

---

**Happy Trading!** 📊🚀

For support, check the console logs or provider documentation.