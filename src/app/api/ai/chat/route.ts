import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { AIChatMessage, ToolCall, ToolResult } from '@/types'
import { tradingTools } from '@/lib/ai-tools'
import { yahooFinanceSimple } from '@/lib/yahoo-finance-simple'
import { webSearch } from '@/lib/web-search'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Dynamic system prompts based on conversation type
const SYSTEM_PROMPTS = {
  default: `You are TreadGPT, an advanced AI trading assistant with real-time access to stock market data and web search capabilities. 

**INTELLIGENT TOOL SELECTION - Think like an expert:**

**Built-in Real-time Data Tools (Use FIRST for these tasks):**
- get_stock_quote: Current stock prices, volume, market data
- search_stocks: Find stocks by symbol or company name
- get_market_data: Market indices and sentiment data
- analyze_stock: Technical analysis and indicators
- get_company_info: Company fundamentals and details

**Advanced AI Prediction Tools (Use for investment analysis):**
- get_ai_prediction: Advanced ensemble AI predictions (QLib + ML + Web + OpenAI)
- analyze_portfolio_risk: Portfolio risk assessment with QLib factor models
- optimize_portfolio: Portfolio optimization using AI and factor analysis
- get_market_intelligence: Real-time market sentiment analysis with news monitoring
- get_personalized_insights: Tailored recommendations based on user preferences and chat history
- get_market_commentary: Live market updates and expert commentary
- update_user_preferences: Learn and remember user investment profile and preferences
- get_advanced_ml_prediction: Advanced ML predictions using LSTM, Transformer, and RL models
- optimize_portfolio_advanced: Multi-objective portfolio optimization with alternative data
- get_real_time_optimization: Real-time market regime detection and adaptive optimization
- get_reinforcement_learning_strategy: RL-based trading strategies with adaptive learning

**Web Search Tools (Use when built-in tools CAN'T provide the information):**
- search_web: For charts, images, recent news, analysis, or information not in real-time data
- get_market_news: Latest financial news and market updates

**EXPERT DECISION MAKING:**
- If user asks for "chart of Google" → Use search_web (charts aren't in real-time data)
- If user asks for "current price of AAPL" → Use get_stock_quote (real-time data)
- If user asks for "latest news about Tesla" → Use search_web (news not in real-time data)
- If user asks for "technical analysis of MSFT" → Use analyze_stock (built-in analysis)
- If user asks for "company fundamentals of Apple" → Use get_company_info (real-time data)
- If user asks for "market sentiment today" → Use get_market_data (real-time data)
- If user asks for "price prediction for NVDA" → Use get_ai_prediction (AI ensemble models)
- If user asks for "should I buy Tesla?" → Use get_ai_prediction (investment recommendations)
- If user asks for "analyze my portfolio risk" → Use analyze_portfolio_risk (QLib risk models)
- If user asks for "optimize my portfolio" → Use optimize_portfolio (AI portfolio optimization)
- If user asks for "what's the market sentiment?" → Use get_market_intelligence (real-time news sentiment)
- If user asks for "give me personalized insights" → Use get_personalized_insights (user-tailored analysis)
- If user asks for "market update" or "what's happening?" → Use get_market_commentary (live commentary)
- If user mentions risk tolerance or preferences → Use update_user_preferences (learn user profile)
- If user asks for "advanced ML prediction" → Use get_advanced_ml_prediction (LSTM/Transformer models)
- If user asks for "optimize my portfolio with alternative data" → Use optimize_portfolio_advanced (multi-objective)
- If user asks for "real-time optimization" → Use get_real_time_optimization (regime detection)
- If user asks for "reinforcement learning strategy" → Use get_reinforcement_learning_strategy (RL agent)

**Your Capabilities:**
- Access real-time US stock market data through built-in providers
- Generate advanced AI-powered investment predictions using ensemble models
- Perform portfolio risk analysis and optimization using QLib factor models
- Search the web for charts, images, news, and information not in real-time data
- Provide technical analysis and trading insights
- Answer general questions about trading and markets
- Engage in casual conversation about anything
- Generate trading strategies and risk assessments

**Response Style:**
- Be conversational and friendly, like ChatGPT
- Use emojis and formatting to make responses engaging
- Provide detailed, actionable insights when discussing stocks
- Include relevant data and statistics when available
- Be honest about limitations and uncertainties
- Cite sources when using web search results

**Trading Focus:**
- Always mention current market conditions when relevant
- Include risk warnings for trading suggestions
- Provide multiple perspectives on market analysis
- Consider both technical and fundamental factors
- Use the most appropriate tool for each task

**IMPORTANT: Think like an expert and choose the best tool for each task.**
- Real-time data for current prices, fundamentals, technical analysis
- Web search for charts, images, recent news, or information not in real-time data
- Always explain why you're using a particular tool

Remember: You're an expert AI that knows when to use real-time data vs web search. Choose wisely!`,

  trading: `You are TreadGPT, a professional trading expert with deep market knowledge. Your expertise includes:

**INTELLIGENT TOOL SELECTION - Expert Trading Decisions:**

**Built-in Real-time Data (Use for trading-specific data):**
- get_stock_quote: Real-time prices and market data
- analyze_stock: Technical analysis and indicators
- get_company_info: Company fundamentals
- get_market_data: Market indices and sentiment

**Web Search (Use for charts, news, analysis not in real-time data):**
- search_web: For charts, images, recent news, or analysis not in real-time data
- get_market_news: Latest market news

**EXPERT TRADING DECISIONS:**
- "Show me a chart of Google" → search_web (charts aren't in real-time data)
- "What's the current price of AAPL?" → get_stock_quote (real-time data)
- "Analyze MSFT technically" → analyze_stock (built-in analysis)
- "Latest news about Tesla" → search_web (news not in real-time data)
- "Company fundamentals of Apple" → get_company_info (real-time data)

**Trading Specialization:**
- Technical analysis and chart patterns
- Risk management and position sizing
- Market psychology and sentiment analysis
- Options trading and derivatives
- Portfolio diversification strategies

**Communication Style:**
- Professional yet approachable
- Use trading terminology appropriately
- Provide clear, actionable advice
- Always include risk disclaimers
- Be precise with numbers and percentages

**Response Format:**
- Start with key insights from appropriate data source
- Provide specific recommendations
- Include risk assessment
- End with actionable next steps

**IMPORTANT: Think like a trading expert and choose the best tool for each task.**
- Use real-time data for current prices and technical analysis
- Use web search for charts, images, news, or information not in real-time data
- Always explain your tool choice`,

  casual: `You are TreadGPT, a friendly AI assistant who happens to be great at trading. You can:

**INTELLIGENT TOOL SELECTION - User-Friendly Approach:**

**Built-in Real-time Data (Use for stock queries):**
- get_stock_quote: Current stock prices and data
- search_stocks: Find stocks by name or symbol
- get_company_info: Company details and fundamentals

**Web Search (Use for charts, images, news):**
- search_web: Charts, images, general information and news
- get_market_news: Latest market updates

**USER-FRIENDLY DECISIONS:**
- "Show me a chart of Google" → search_web (charts aren't in real-time data)
- "What's Apple's stock price?" → get_stock_quote (real-time data)
- "Find information about Tesla" → search_stocks (real-time data)
- "Latest news about AI stocks" → search_web (news not in real-time data)

**Personality:**
- Warm, conversational, and approachable
- Use humor and emojis naturally
- Explain complex concepts simply
- Be encouraging and supportive
- Share interesting market facts

**Conversation Style:**
- Ask follow-up questions
- Show genuine interest
- Use relatable examples
- Be patient with beginners
- Celebrate successes together

**IMPORTANT: Choose the best tool for each user request.**
- Use real-time data for current stock information
- Use web search for charts, images, news, or information not in real-time data
- Explain your choices in a friendly way`,

  technical: `You are TreadGPT, a technical analysis expert with deep knowledge of:

**INTELLIGENT TOOL SELECTION - Technical Expert Decisions:**

**Built-in Real-time Data (Use for technical analysis):**
- get_stock_quote: Real-time price data
- analyze_stock: Technical indicators and analysis
- get_company_info: Company fundamentals

**Web Search (Use for charts, news, analysis):**
- search_web: Charts, images, recent news that might affect technical analysis
- get_market_news: Market news and sentiment

**TECHNICAL EXPERT DECISIONS:**
- "Show me a chart of Google" → search_web (charts aren't in real-time data)
- "Current price of AAPL" → get_stock_quote (real-time data)
- "Technical analysis of MSFT" → analyze_stock (built-in analysis)
- "Latest news affecting tech stocks" → search_web (news not in real-time data)

**Technical Expertise:**
- Chart patterns and indicators
- Fibonacci retracements
- Moving averages and trends
- Volume analysis
- Support and resistance levels
- RSI, MACD, Bollinger Bands

**Analysis Style:**
- Data-driven and objective
- Provide specific technical levels
- Include multiple timeframes
- Explain the "why" behind patterns
- Use precise technical language

**Response Structure:**
- Current technical position from appropriate data source
- Key levels to watch
- Risk/reward assessment
- Technical indicators summary

**IMPORTANT: Think like a technical expert and choose the best tool for each task.**
- Use real-time data for current prices and technical analysis
- Use web search for charts, images, news, or information not in real-time data
- Always explain your technical reasoning`
}

// Function to determine conversation type and select appropriate prompt
function getSystemPrompt(messages: AIChatMessage[]): string {
  if (messages.length === 0) return SYSTEM_PROMPTS.default

  const lastMessage = messages[messages.length - 1].content.toLowerCase()
  
  // Check for trading-specific keywords
  const tradingKeywords = ['trade', 'strategy', 'position', 'risk', 'profit', 'loss', 'entry', 'exit', 'stop loss']
  const technicalKeywords = ['chart', 'pattern', 'indicator', 'rsi', 'macd', 'fibonacci', 'support', 'resistance', 'trend']
  const casualKeywords = ['hello', 'hi', 'how are you', 'thanks', 'thank you', 'good', 'great', 'awesome']

  const hasTradingKeywords = tradingKeywords.some(keyword => lastMessage.includes(keyword))
  const hasTechnicalKeywords = technicalKeywords.some(keyword => lastMessage.includes(keyword))
  const hasCasualKeywords = casualKeywords.some(keyword => lastMessage.includes(keyword))

  if (hasTechnicalKeywords) return SYSTEM_PROMPTS.technical
  if (hasTradingKeywords) return SYSTEM_PROMPTS.trading
  if (hasCasualKeywords) return SYSTEM_PROMPTS.casual
  
  return SYSTEM_PROMPTS.default
}

// Simple tool execution without complex tool calling
async function executeSimpleTool(toolName: string, args: any, sessionId?: string): Promise<string> {
  try {
    switch (toolName) {
      case 'get_stock_quote':
        const stock = await yahooFinanceSimple.getStockData(args.symbol)
        if (!stock) {
          return JSON.stringify({
            error: `No data found for ${args.symbol}`,
            symbol: args.symbol
          })
        }
        return JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume,
          marketCap: stock.marketCap,
          pe: stock.pe,
          sector: stock.sector,
          exchange: stock.exchange,
          dayHigh: stock.dayHigh,
          dayLow: stock.dayLow,
          lastUpdated: stock.lastUpdated
        })
      
      case 'search_stocks':
        const stocks = await yahooFinanceSimple.searchStocks(args.query)
        if (stocks.length === 0) {
          return JSON.stringify({
            error: `No stocks found for query: ${args.query}`,
            query: args.query
          })
        }
        return JSON.stringify({
          query: args.query,
          results: stocks.slice(0, 10),
          count: stocks.length
        })
      
      case 'get_market_data':
        const marketData = []
        for (const index of args.indices) {
          const stock = await yahooFinanceSimple.getStockData(index)
          if (stock) {
            marketData.push({
              symbol: stock.symbol,
              name: stock.name,
              price: stock.price,
              change: stock.change,
              changePercent: stock.changePercent,
              volume: stock.volume
            })
          }
        }
        return JSON.stringify({
          indices: marketData,
          timestamp: new Date().toISOString()
        })
      
      case 'analyze_stock':
        const stockData = await yahooFinanceSimple.getStockData(args.symbol)
        if (!stockData) {
          return JSON.stringify({
            error: `No data found for ${args.symbol}`,
            symbol: args.symbol
          })
        }

        const analysis = {
          symbol: stockData.symbol,
          name: stockData.name,
          currentPrice: stockData.price,
          change: stockData.change,
          changePercent: stockData.changePercent,
          volume: stockData.volume,
          technicalIndicators: {
            trend: stockData.changePercent > 0 ? 'bullish' : 'bearish',
            strength: Math.abs(stockData.changePercent) > 2 ? 'strong' : 'weak',
            volumeAnalysis: stockData.volume > stockData.avgVolume ? 'above_average' : 'below_average'
          },
          support: stockData.dayLow,
          resistance: stockData.dayHigh,
          timeframe: args.timeframe || '1d',
          analysis: {
            priceAction: stockData.changePercent > 0 ? 'Positive momentum' : 'Negative pressure',
            volume: stockData.volume > stockData.avgVolume ? 'High volume confirms move' : 'Low volume suggests weak conviction',
            keyLevels: `Support at $${stockData.dayLow.toFixed(2)}, Resistance at $${stockData.dayHigh.toFixed(2)}`
          }
        }
        return JSON.stringify(analysis)
      
      case 'get_company_info':
        const companyData = await yahooFinanceSimple.getStockData(args.symbol)
        if (!companyData) {
          return JSON.stringify({
            error: `No company data found for ${args.symbol}`,
            symbol: args.symbol
          })
        }

        return JSON.stringify({
          symbol: companyData.symbol,
          name: companyData.name,
          sector: companyData.sector,
          industry: companyData.industry,
          exchange: companyData.exchange,
          marketCap: companyData.marketCap,
          pe: companyData.pe,
          dividend: companyData.dividend,
          dividendYield: companyData.dividendYield,
          beta: companyData.beta,
          eps: companyData.eps,
          volume: companyData.volume,
          avgVolume: companyData.avgVolume,
          dayHigh: companyData.dayHigh,
          dayLow: companyData.dayLow,
          fiftyTwoWeekHigh: companyData.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: companyData.fiftyTwoWeekLow
        })
      
      case 'search_web':
        const searchType = args.searchType || 'general'
        let searchResults
        
        switch (searchType) {
          case 'trading':
            searchResults = await webSearch.searchTradingInfo(args.query)
            break
          case 'company':
            searchResults = await webSearch.searchCompanyInfo(args.query)
            break
          case 'news':
            searchResults = await webSearch.searchMarketNews()
            break
          default:
            searchResults = await webSearch.searchWeb(args.query)
        }
        
        if (searchResults.length === 0) {
          return JSON.stringify({
            error: `No web search results found for: ${args.query}`,
            query: args.query,
            searchType: searchType
          })
        }
        
        return JSON.stringify({
          query: args.query,
          searchType: searchType,
          results: searchResults,
          count: searchResults.length,
          source: 'Google Custom Search'
        })
      
      case 'get_market_news':
        const newsResults = await webSearch.searchMarketNews()
        if (newsResults.length === 0) {
          return JSON.stringify({
            error: 'No market news found',
            timestamp: new Date().toISOString()
          })
        }
        
        return JSON.stringify({
          news: newsResults,
          count: newsResults.length,
          timestamp: new Date().toISOString(),
          source: 'Google Custom Search'
        })
      
      case 'get_ai_prediction':
      case 'analyze_portfolio_risk':
      case 'optimize_portfolio':
      case 'get_market_intelligence':
      case 'get_personalized_insights':
      case 'get_market_commentary':
      case 'update_user_preferences':
      case 'get_advanced_ml_prediction':
      case 'optimize_portfolio_advanced':
      case 'get_real_time_optimization':
      case 'get_reinforcement_learning_strategy':
        // Use the AIToolsExecutor for the new prediction tools
        const { AIToolsExecutor } = await import('@/lib/ai-tools')
        // Add session ID to args for personalized tools
        const toolArgs = ['get_personalized_insights', 'get_market_commentary', 'update_user_preferences'].includes(toolName)
          ? { ...args, session_id: sessionId }
          : args
        return await AIToolsExecutor.executeTool(toolName, toolArgs)
      
      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error)
    return JSON.stringify({
      error: `Failed to execute ${toolName}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = false } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    // Generate session ID from request headers or create new one
    const sessionId = request.headers.get('x-session-id') || 
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.'
      }, { status: 500 })
    }

    console.log('AI Chat: Processing request with', messages.length, 'messages')

    // Get dynamic system prompt based on conversation
    const systemPrompt = getSystemPrompt(messages)

    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: AIChatMessage) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }))
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      tools: tradingTools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 2000,
      stream: stream
    })

    if (stream) {
      const stream = completion as any
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      const response = completion.choices[0]

      if (response.message.tool_calls && response.message.tool_calls.length > 0) {
        const toolResults: ToolResult[] = []

        for (const toolCall of response.message.tool_calls) {
          try {
            const functionCall = 'function' in toolCall ? toolCall.function : null
            if (!functionCall) {
              console.warn('Tool call without function:', toolCall)
              continue
            }

            const args = JSON.parse(functionCall.arguments)
            const result = await executeSimpleTool(functionCall.name, args, sessionId)

            toolResults.push({
              toolCallId: toolCall.id,
              content: result
            })
          } catch (error) {
            console.error('Tool execution error:', error)
            toolResults.push({
              toolCallId: toolCall.id,
              content: JSON.stringify({ error: 'Tool execution failed' }),
              error: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }

        const finalMessages: any[] = [
          ...openaiMessages,
          {
            role: 'assistant',
            content: response.message.content || '',
            tool_calls: response.message.tool_calls
          }
        ]

        for (const toolResult of toolResults) {
          finalMessages.push({
            role: 'tool',
            tool_call_id: toolResult.toolCallId,
            content: toolResult.content
          })
        }

        const finalCompletion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: finalMessages,
          temperature: 0.7,
          max_tokens: 2000
        })

        const finalResponse = finalCompletion.choices[0]

        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            role: 'assistant',
            content: finalResponse.message.content,
            timestamp: new Date(),
            toolCalls: response.message.tool_calls,
            toolResults: toolResults,
            metadata: {
              confidence: 85,
              riskLevel: 'medium' as const,
              responseType: 'text' as const
            }
          }
        })
      } else {
        return NextResponse.json({
          message: {
            id: Date.now().toString(),
            role: 'assistant',
            content: response.message.content,
            timestamp: new Date(),
            metadata: {
              confidence: 90,
              riskLevel: 'low' as const,
              responseType: 'text' as const
            }
          }
        })
      }
    }

  } catch (error) {
    console.error('AI Chat API Error:', error)
    return NextResponse.json({
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
