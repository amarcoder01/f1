import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { symbol, timeframe, chartData, currentPrice, priceChange, query, analysisType } = body
  
  try {

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured',
          mock: true 
        },
        { status: 500 }
      )
    }

    // Create context for AI analysis
    const context = `
      Analyzing ${symbol} stock on ${timeframe} timeframe.
      Current Price: $${currentPrice}
      Price Change: ${priceChange}%
      Data Points: ${chartData.length} recent price points
      
      Chart Data Summary:
      - Latest Close: $${chartData[chartData.length - 1]?.close || currentPrice}
      - High: $${Math.max(...chartData.map((d: any) => d.high))}
      - Low: $${Math.min(...chartData.map((d: any) => d.low))}
      - Volume Trend: ${chartData[chartData.length - 1]?.volume > chartData[chartData.length - 10]?.volume ? 'Increasing' : 'Decreasing'}
    `

    let prompt = ''
    let systemMessage = ''

    switch (analysisType) {
      case 'prediction':
        systemMessage = `You are an expert financial analyst and AI trading assistant. Analyze the provided stock data and provide detailed market predictions with confidence levels, target prices, and stop losses. Be specific and actionable.`
        prompt = `${context}
        
        Please provide a comprehensive market prediction for ${symbol} including:
        1. Short-term prediction (1 week)
        2. Medium-term prediction (1 month)
        3. Target prices and stop losses
        4. Confidence levels
        5. Key reasoning factors
        
        Format your response as JSON with the following structure:
        {
          "predictions": [
            {
              "timeframe": "1 week",
              "prediction": "bullish/bearish/neutral",
              "confidence": 85,
              "targetPrice": 155.50,
              "stopLoss": 145.00,
              "reasoning": "Detailed explanation"
            }
          ]
        }`
        break

      case 'insights':
        systemMessage = `You are a technical analysis expert. Identify patterns, trends, and technical insights from the provided chart data.`
        prompt = `${context}
        
        Analyze the technical patterns and provide insights including:
        1. Chart patterns (support/resistance, trends, formations)
        2. Technical indicators analysis
        3. Volume analysis
        4. Risk assessment
        
        Format as JSON:
        {
          "insights": [
            {
              "pattern": "Pattern Name",
              "strength": "strong/moderate/weak",
              "description": "Detailed description",
              "probability": 75,
              "action": "Recommended action"
            }
          ]
        }`
        break

      case 'sentiment':
        systemMessage = `You are a market sentiment analyst. Evaluate the overall market sentiment based on price action, volume, and technical indicators.`
        prompt = `${context}
        
        Provide sentiment analysis including:
        1. Overall sentiment (positive/negative/neutral)
        2. Sentiment score (1-10)
        3. Key factors influencing sentiment
        4. News and social media impact assessment
        
        Format as JSON:
        {
          "sentiment": {
            "overall": "positive",
            "score": 7.2,
            "factors": ["factor1", "factor2"],
            "newsImpact": "Description",
            "socialSentiment": "Description"
          }
        }`
        break

      case 'chat':
        systemMessage = `You are an AI trading assistant. Answer questions about the stock chart and provide trading advice based on technical analysis. Be helpful, accurate, and actionable.`
        prompt = `${context}
        
        User Question: "${query}"
        
        Please provide a detailed, helpful response about the chart analysis, patterns, and trading recommendations.`
        break

      default:
        systemMessage = `You are an AI-powered financial analyst. Provide comprehensive analysis of the stock data.`
        prompt = `${context}
        
        Provide a comprehensive analysis including:
        1. Overall market outlook
        2. Key technical patterns
        3. Risk factors
        4. Trading recommendations
        
        Be specific and actionable.`
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || ''

    // Try to parse JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(response)
    } catch {
      // If not JSON, return as text
      parsedResponse = { response }
    }

    return NextResponse.json({
      success: true,
      data: parsedResponse,
      mock: false
    })

  } catch (error) {
    console.error('AI Analysis Error:', error)
    
    // Return mock data if OpenAI fails
    return NextResponse.json({
      success: false,
      error: 'AI analysis failed, using mock data',
      mock: true,
      data: generateMockData(body.analysisType, body.symbol)
    })
  }
}

function generateMockData(analysisType: string, symbol: string) {
  switch (analysisType) {
    case 'prediction':
      return {
        predictions: [
          {
            timeframe: "1 week",
            prediction: "bullish",
            confidence: 85,
            targetPrice: 155.50,
            stopLoss: 145.00,
            reasoning: "Strong technical indicators, positive earnings outlook, and institutional accumulation suggest upward movement."
          },
          {
            timeframe: "1 month",
            prediction: "bullish",
            confidence: 72,
            targetPrice: 165.00,
            stopLoss: 140.00,
            reasoning: "Long-term trend remains bullish with support from fundamental analysis and sector rotation."
          }
        ]
      }

    case 'insights':
      return {
        insights: [
          {
            pattern: "Ascending Triangle",
            strength: "strong",
            description: "Price consolidating in ascending triangle pattern with higher lows and flat resistance.",
            probability: 75,
            action: "Breakout likely above $152, target $160"
          },
          {
            pattern: "RSI Divergence",
            strength: "moderate",
            description: "Bullish RSI divergence forming as price makes lower lows but RSI makes higher lows.",
            probability: 65,
            action: "Potential reversal signal, monitor for confirmation"
          }
        ]
      }

    case 'sentiment':
      return {
        sentiment: {
          overall: "positive",
          score: 7.2,
          factors: [
            "Positive earnings expectations",
            "Strong institutional buying",
            "Favorable analyst ratings"
          ],
          newsImpact: "Recent product announcements well-received",
          socialSentiment: "65% positive mentions on social media"
        }
      }

    case 'chat':
      return {
        response: `Based on the current chart analysis for ${symbol}, I can see several key patterns. The price action shows strong bullish momentum with the RSI indicating oversold conditions that have been resolved. The volume profile suggests institutional accumulation, and the moving averages are aligned for continued upward movement. My recommendation would be to consider a long position with a stop loss below the recent support level.`
      }

    default:
      return {
        analysis: "Comprehensive market analysis with bullish outlook based on technical indicators and volume analysis."
      }
  }
}
