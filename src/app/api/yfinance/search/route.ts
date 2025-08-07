// yfinance Search API Route - Uses Python yfinance library
import { NextRequest, NextResponse } from 'next/server'
import { Stock } from '@/types'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    console.log('API: Searching stocks via yfinance for:', query)

    // Create Python script to search using yfinance
    const pythonScript = `
import yfinance as yf
import json
import sys

try:
    # Search for stocks
    search_results = yf.Tickers("${query}")
    
    stocks = []
    count = 0
    
    for symbol in search_results.tickers:
        if count >= 8:  # Limit to 8 results
            break
            
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Get basic data
            current_price = info.get('currentPrice', 0)
            if not current_price:
                current_price = info.get('regularMarketPrice', 0)
            
            previous_close = info.get('previousClose', current_price)
            change = current_price - previous_close
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            # Get additional data
            volume = info.get('volume', 0)
            market_cap = info.get('marketCap', 0)
            pe_ratio = info.get('trailingPE', 0)
            dividend_yield = info.get('dividendYield', 0)
            day_high = info.get('dayHigh', current_price)
            day_low = info.get('dayLow', current_price)
            fifty_two_week_high = info.get('fiftyTwoWeekHigh', current_price)
            fifty_two_week_low = info.get('fiftyTwoWeekLow', current_price)
            avg_volume = info.get('averageVolume', volume)
            beta = info.get('beta', 0)
            eps = info.get('trailingEps', 0)
            
            # Company info
            company_name = info.get('longName', info.get('shortName', symbol))
            sector = info.get('sector', 'Unknown')
            industry = info.get('industry', 'Unknown')
            exchange = info.get('exchange', 'NASDAQ')
            
            # Map exchange
            if 'NYSE' in exchange:
                exchange_mapped = 'NYSE'
            elif 'NASDAQ' in exchange:
                exchange_mapped = 'NASDAQ'
            else:
                exchange_mapped = 'OTC'
            
            # Create stock object
            stock = {
                "symbol": symbol,
                "name": company_name,
                "price": current_price,
                "change": change,
                "changePercent": change_percent,
                "volume": volume,
                "marketCap": market_cap,
                "pe": pe_ratio,
                "dividend": dividend_yield * current_price if dividend_yield else 0,
                "sector": sector,
                "industry": industry,
                "exchange": exchange_mapped,
                "dayHigh": day_high,
                "dayLow": day_low,
                "fiftyTwoWeekHigh": fifty_two_week_high,
                "fiftyTwoWeekLow": fifty_two_week_low,
                "avgVolume": avg_volume,
                "dividendYield": dividend_yield * 100 if dividend_yield else 0,
                "beta": beta,
                "eps": eps,
                "lastUpdated": "${new Date().toISOString()}"
            }
            
            stocks.append(stock)
            count += 1
            
        except Exception as e:
            continue  # Skip this stock if there's an error
    
    print(json.dumps({"success": True, "stocks": stocks}))
    
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`

    // Execute Python script
    const { stdout, stderr } = await execAsync(`python -c "${pythonScript.replace(/"/g, '\\"')}"`)

    if (stderr) {
      console.error('Python stderr:', stderr)
    }

    const result = JSON.parse(stdout.trim())
    
    if (!result.success) {
      console.log(`API: yfinance search failed:`, result.error)
      return NextResponse.json({ error: `Failed to search for ${query}` }, { status: 404 })
    }

    console.log(`API: Successfully found ${result.stocks.length} stocks via yfinance`)
    return NextResponse.json(result)

  } catch (error) {
    console.error('API: yfinance search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
