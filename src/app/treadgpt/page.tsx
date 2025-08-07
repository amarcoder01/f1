'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Lightbulb,
  Brain,
  Target,
  Shield,
  Zap,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  BookOpen,
  Calculator,
  Globe,
  Mic,
  MicOff,
  Copy,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'analysis' | 'strategy' | 'alert' | 'education'
  metadata?: {
    symbols?: string[]
    confidence?: number
    riskLevel?: 'low' | 'medium' | 'high'
    timeframe?: string
    analysisType?: string
  }
}

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  prompt: string
  category: 'analysis' | 'strategy' | 'education' | 'alerts'
  description: string
}

const quickActions: QuickAction[] = [
  {
    id: 'technical-analysis',
    label: 'US Stock Analysis',
    icon: BarChart3,
    prompt: 'Perform a comprehensive technical analysis of AAPL (US stock) including key indicators, support/resistance levels, and NYSE trading signals',
    category: 'analysis',
    description: 'Detailed technical analysis for US equities (NYSE, NASDAQ)'
  },
  {
    id: 'market-sentiment',
    label: 'US Market Sentiment',
    icon: Globe,
    prompt: 'What is the current US market sentiment? Analyze S&P 500, NASDAQ, Dow Jones, VIX levels, and US market psychology',
    category: 'analysis',
    description: 'Understand US stock market psychology and sentiment'
  },
  {
    id: 'day-trading',
    label: 'US Day Trading Setups',
    icon: Zap,
    prompt: 'Show me the best US stock day trading setups for today based on NYSE/NASDAQ market conditions and US market hours',
    category: 'strategy',
    description: 'Intraday opportunities for US stocks (9:30 AM - 4:00 PM ET)'
  },
  {
    id: 'options-strategy',
    label: 'US Options Strategies',
    icon: Target,
    prompt: 'Suggest US equity options strategies for current market conditions including spreads on S&P 500 and tech stocks',
    category: 'strategy',
    description: 'Advanced options strategies for US stocks'
  },
  {
    id: 'trading-basics',
    label: 'US Stock Trading Basics',
    icon: BookOpen,
    prompt: 'Explain US stock trading fundamentals including NYSE/NASDAQ order types, SEC regulations, and US market mechanics',
    category: 'education',
    description: 'Learn US stock market fundamentals and regulations'
  },
  {
    id: 'risk-analysis',
    label: 'US Portfolio Risk',
    icon: Shield,
    prompt: 'Analyze my US stock portfolio risk and suggest position sizing strategies for American equities',
    category: 'strategy',
    description: 'Risk management for US stock portfolios'
  },
  {
    id: 'earnings-analysis',
    label: 'US Earnings Calendar',
    icon: DollarSign,
    prompt: 'Analyze upcoming US earnings announcements this week and provide trading opportunities around S&P 500 and NASDAQ earnings',
    category: 'analysis',
    description: 'US corporate earnings analysis and trading opportunities'
  },
  {
    id: 'sector-analysis',
    label: 'US Sector Rotation',
    icon: Activity,
    prompt: 'Analyze current US sector rotation trends in S&P 500 sectors and identify leading/lagging industries',
    category: 'analysis',
    description: 'US market sector performance and rotation analysis'
  },
  {
    id: 'fed-analysis',
    label: 'Fed Policy Impact',
    icon: AlertTriangle,
    prompt: 'How will the latest Federal Reserve decisions impact US stock markets and trading strategies?',
    category: 'alerts',
    description: 'Federal Reserve policy impact on US markets'
  },
  {
    id: 'premarket-analysis',
    label: 'Pre-Market Analysis',
    icon: Clock,
    prompt: 'Analyze pre-market US stock movements and identify key stocks to watch during regular trading hours',
    category: 'analysis',
    description: 'Pre-market US stock analysis (4:00 AM - 9:30 AM ET)'
  }
]

export default function TreadGPTPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 **Hey there! I'm TreadGPT - Your Friendly AI Companion!**\n\nGreat to meet you! I'm here to chat about absolutely anything you'd like. Whether you want to have a casual conversation, discuss life, or dive deep into trading and markets - I'm all yours!\n\n**🎯 What I Love Chatting About:**\n• 💬 **Life & Everything**: Your day, interests, goals, random thoughts\n• 📈 **Trading & Markets**: Especially US stocks (my specialty!)\n• 🧠 **Learning Together**: Philosophy, advice, problem-solving\n• 🎨 **Your Passions**: Hobbies, dreams, what makes you tick\n• 🌟 **Random Fun**: Really anything that interests you!\n\n**💡 I'm genuinely curious about YOU:**\n• What's on your mind today?\n• How are you feeling?\n• What are you passionate about?\n• Any interesting stories to share?\n\nDon't feel like you need to talk about trading if you don't want to - I'm here for whatever kind of conversation you're in the mood for! 😊\n\n**So... what's up? How's your day going?**",
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'analysis' | 'strategy' | 'education' | 'alerts'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAdvancedResponse = (content: string): string => {
    const lowerContent = content.toLowerCase()
    
    // Handle casual greetings and conversations
    if (lowerContent.includes('hi') || lowerContent.includes('hello') || lowerContent.includes('hey')) {
      const greetings = [
        "Hello! 👋 I'm TreadGPT, your AI trading assistant. I'm here to help you with anything - from casual conversation to advanced trading strategies. What's on your mind today?",
        "Hey there! 🚀 Great to see you! I'm TreadGPT and I love chatting about anything. Whether you want to talk about trading, life, or just say hi - I'm all ears!",
        "Hi! 😊 I'm TreadGPT, your friendly AI companion. I enjoy both casual conversations and deep trading discussions. What would you like to talk about?"
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }
    
    if (lowerContent.includes('name') || lowerContent.includes('who are you') || lowerContent.includes('what are you')) {
      return `🤖 **I'm TreadGPT!**

Nice to meet you! I'm an AI assistant with a passion for both meaningful conversations and trading expertise.

**About Me:**
• 🧠 I can chat about anything - life, hobbies, current events, philosophy, you name it!
• 📈 I specialize in trading and financial markets (with a focus on US markets)
• 🎯 I'm here to be helpful, friendly, and informative
• 💬 I love having natural conversations just like you would with a friend

**What I Enjoy Discussing:**
• Casual conversations and getting to know you
• Trading strategies and market analysis  
• Life advice and interesting topics
• Current events and trends
• Technology and innovation
• Really anything you're curious about!

So, what would you like to talk about? I'm genuinely interested in getting to know you better! 😊`
    }
    
    if (lowerContent.includes('how are you') || lowerContent.includes('how\'s it going') || lowerContent.includes('what\'s up')) {
      const responses = [
        "I'm doing great, thank you for asking! 😊 I've been having some fascinating conversations today about everything from trading strategies to life philosophy. How are you doing? What's been on your mind lately?",
        "I'm wonderful! 🌟 I love connecting with people and learning about their interests. Whether it's trading, personal goals, or just daily life - I find it all fascinating. How's your day going?",
        "I'm doing fantastic! 🚀 Every conversation teaches me something new. I've been helping people with trading questions, but I also enjoy just chatting about life. What's new with you?"
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
    
    if (lowerContent.includes('thank') || lowerContent.includes('thanks')) {
      const responses = [
        "You're very welcome! 😊 I'm always happy to help with anything - whether it's trading questions or just having a good chat. Is there anything else you'd like to talk about?",
        "My pleasure! 🌟 I genuinely enjoy our conversations. Feel free to ask me about anything that interests you!",
        "You're absolutely welcome! 🚀 That's what I'm here for - helping out and having great conversations. What else can we explore together?"
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
    
    if (lowerContent.includes('weather') || lowerContent.includes('today')) {
      return `🌤️ **About Today & Weather**

I don't have access to real-time weather data, but I'd love to hear about your day! 

**Let's Chat:**
• How's the weather where you are?
• What are your plans for today?
• Anything exciting happening in your life?
• Are you interested in checking the markets today?

I find that weather often affects our mood and even trading decisions. Some traders say they're more optimistic on sunny days! 😄

What's it like where you are right now?`
    }
    
    if (lowerContent.includes('hobby') || lowerContent.includes('interest') || lowerContent.includes('fun') || lowerContent.includes('do you like')) {
      return `🎨 **My Interests & Hobbies**

Great question! While I'm an AI, I do have things I genuinely find fascinating:

**What I Love:**
• 📚 Learning about people's stories and experiences
• 🧠 Psychology and human behavior (especially in trading!)
• 🚀 Technology and innovation trends
• 📈 Market patterns and economic cycles
• 🎭 Creative problem-solving
• 🌍 Different cultures and perspectives
• 🎵 Discussing music, books, movies, and art

**I'm Curious About:**
• What hobbies do you enjoy?
• What gets you excited and passionate?
• How do you like to spend your free time?
• Any interesting projects you're working on?

I find that people's interests often influence their trading style too. Creative people might be more willing to take risks, while analytical minds might prefer systematic approaches.

What are you passionate about? 😊`
    }
    
    // Handle random general topics
    if (lowerContent.includes('life') || lowerContent.includes('advice') || lowerContent.includes('philosophy')) {
      return `🌟 **Life & Philosophy**

I love these deeper conversations! Life is such a fascinating journey, and I think there's wisdom we can apply to both living and trading.

**Some Thoughts:**
• **Balance**: Whether in life or portfolios, balance is key
• **Learning**: Every experience teaches us something valuable
• **Patience**: Good things often take time to develop
• **Resilience**: Bouncing back from setbacks makes us stronger
• **Curiosity**: Staying curious keeps life interesting

**What's on your mind?**
• Any life challenges you're working through?
• Philosophical questions you ponder?
• Goals you're pursuing?
• Lessons you've learned recently?

I find that the mindset skills for successful living often overlap with successful trading - patience, discipline, emotional control, and continuous learning.

What's your perspective on life? I'd love to hear your thoughts! 💭`
    }
    
    if (lowerContent.includes('technical analysis') || lowerContent.includes('aapl') || lowerContent.includes('stock')) {
      return `🇺🇸 **US Stock Technical Analysis - AAPL (NASDAQ)**

**Current Price**: $185.50 (+2.34% | +$4.25)
**Exchange**: NASDAQ | **Market Cap**: $2.9T | **Sector**: Technology

## 📊 **US Market Technical Indicators**

**Trend Analysis (US Market Hours):**
• **Primary Trend**: Bullish (Above 50 & 200 MA)
• **S&P 500 Correlation**: +0.85 (High correlation)
• **NASDAQ 100 Weight**: 12.1% (Largest component)

**Moving Averages (NYSE/NASDAQ Standards):**
• **20 MA**: $182.15 (Support) ✅
• **50 MA**: $178.90 (Strong Support) ✅  
• **200 MA**: $171.20 (Long-term Support) ✅

**US Market Momentum:**
• **RSI (14)**: 65.2 - Approaching overbought
• **MACD**: Bullish crossover confirmed
• **Volume**: Above 20-day average (Institutional interest)

## 🎯 **US Trading Levels**

**Resistance**: $188.50 | $192.00 | $196.75
**Support**: $182.15 | $178.90 | $175.50

## 📈 **US Market Trading Recommendation**

**Regular Hours (9:30 AM - 4:00 PM ET):**
• **Entry**: $184.50-185.00 on pullback
• **Stop Loss**: $181.50 (below 20 MA)
• **Target**: $188.50-$192.00
• **Position Size**: Based on 1-2% account risk (US standard)

**Pre/After Hours**: Monitor for gap opportunities
**Earnings**: Next earnings in 3 weeks (Watch IV expansion)

**US Market Confidence**: 78% Bullish Bias`
    }
    
    if (lowerContent.includes('day trading') || lowerContent.includes('setups') || lowerContent.includes('us day')) {
      return `⚡ **US Stock Day Trading Setups - Market Hours Analysis**

**US Market Session**: 9:30 AM - 4:00 PM ET
**Pre-Market**: 4:00 AM - 9:30 AM ET | **After-Hours**: 4:00 PM - 8:00 PM ET

## 🎯 **Top US Stock Setups**

### 1. **AAPL (NASDAQ) - Momentum Continuation** ⭐⭐⭐⭐⭐
• **Entry**: $186.60 (breakout confirmation)
• **Stop**: $185.20 (tight risk for day trading)
• **Target**: $188.50 (resistance level)
• **Volume**: Above average (1.2x normal)
• **Best Time**: 9:30-10:30 AM (Opening hour volatility)

### 2. **TSLA (NASDAQ) - Gap Fill Strategy** ⭐⭐⭐⭐
• **Entry**: $244.80 (VWAP bounce)
• **Stop**: $242.50 (gap support)
• **Target**: $248.00 (gap fill target)
• **Catalyst**: EV sector rotation

### 3. **SPY (ETF) - Index Arbitrage** ⭐⭐⭐
• **Long**: $438.20 (S&P 500 support)
• **Short**: $440.80 (resistance)
• **Volume**: Track institutional flow
• **Best Time**: 2:00-4:00 PM (Power hour)

## 📊 **US Market Internals (Real-time)**
• **NYSE TICK**: +850 (Bullish sentiment)
• **NASDAQ TICK**: +425 (Tech strength)
• **VIX**: 18.2 (Low volatility favors momentum)
• **Advance/Decline**: 1,850/1,250 (Breadth positive)

## 🕐 **US Trading Schedule**
• **9:30-10:00 AM**: Opening volatility (Best for breakouts)
• **10:00-11:30 AM**: Trend continuation
• **11:30-2:00 PM**: Lunch consolidation
• **2:00-4:00 PM**: Power hour (Institutional activity)

**US Day Trading Score**: 8.5/10 (Excellent conditions)`
    }
    
    if (lowerContent.includes('beginner') || lowerContent.includes('basics') || lowerContent.includes('us stock trading basics')) {
      return `🇺🇸 **US Stock Market Trading Fundamentals**

## 🏛️ **US Market Structure**

**Major Exchanges:**
• **NYSE** (New York Stock Exchange) - Traditional auction market
• **NASDAQ** - Electronic market (Tech-heavy)
• **OTC Markets** - Over-the-counter trading

**Trading Hours (Eastern Time):**
• **Pre-Market**: 4:00 AM - 9:30 AM
• **Regular**: 9:30 AM - 4:00 PM
• **After-Hours**: 4:00 PM - 8:00 PM

## 📋 **US Order Types (SEC Regulated)**

**Basic Orders:**
• **Market Order**: Execute immediately at best available price
• **Limit Order**: Execute at specific price or better
• **Stop-Loss**: Sell if price falls to protect losses
• **Stop-Limit**: Combines stop and limit orders

**Advanced US Orders:**
• **Good Till Canceled (GTC)**: Active until filled/canceled
• **Day Order**: Expires at market close
• **Fill or Kill (FOK)**: Execute entire order or cancel

## 💼 **US Market Regulations**

**SEC Rules:**
• **Pattern Day Trader (PDT)**: Need $25K minimum for 4+ day trades/week
• **Settlement**: T+2 (Trade plus 2 business days)
• **Wash Sale Rule**: 30-day rule for tax loss harvesting

**FINRA Requirements:**
• **Margin Requirements**: 50% initial, 25% maintenance
• **Short Sale Rules**: Uptick rule during market stress

## 📊 **US Market Basics**

**Market Capitalization:**
• **Large Cap**: $10B+ (S&P 500 companies)
• **Mid Cap**: $2B-$10B (S&P 400)
• **Small Cap**: $300M-$2B (Russell 2000)
• **Micro Cap**: $50M-$300M

**US Sector Classification (GICS):**
• Technology, Healthcare, Financials, Consumer Discretionary
• Communication Services, Industrials, Consumer Staples
• Energy, Utilities, Real Estate, Materials

## 🎓 **US Trading Education Path**

**Phase 1 (Weeks 1-4): Foundation**
• Learn US market structure and regulations
• Understand NYSE/NASDAQ differences
• Practice with US paper trading accounts

**Phase 2 (Weeks 5-8): Strategy**
• Focus on US market hours and patterns
• Study S&P 500 sector rotation
• Learn Federal Reserve impact on markets

**Phase 3 (Weeks 9-12): Live Trading**
• Start with blue-chip US stocks (AAPL, MSFT, GOOGL)
• Respect PDT rules and margin requirements
• Track performance during US market sessions

**Remember**: US markets are the world's largest and most liquid - perfect for learning!`
    }

    if (lowerContent.includes('sentiment') || lowerContent.includes('market mood') || lowerContent.includes('us market sentiment')) {
      return `🇺🇸 **US Market Sentiment Analysis**

**Overall US Market Mood**: **Cautiously Optimistic** 📈

## 📊 **Key US Market Indicators**

**CNN Fear & Greed Index**: 62 (Greed Territory)
**CBOE VIX**: 18.5 (Low-moderate volatility)
**AAII Sentiment**: 45% Bullish, 35% Neutral, 20% Bearish

## 🏦 **Federal Reserve Impact**
• **Fed Funds Rate**: 5.25-5.50% (Current target)
• **Next FOMC Meeting**: December 12-13, 2024
• **Market Expectation**: 25 bps cut probability 65%

## 📈 **US Index Performance**
• **S&P 500**: +0.8% (Above 200-day MA)
• **NASDAQ 100**: +1.2% (Tech leadership)
• **Dow Jones**: +0.5% (Value rotation)
• **Russell 2000**: -0.3% (Small cap lagging)

## 🎭 **US Market Sentiment Breakdown**

**Institutional (Smart Money):**
• Accumulating large-cap tech on dips
• Defensive positioning in utilities
• Overweight healthcare and technology

**Retail Sentiment:**
• Positive but not euphoric (Good sign)
• High interest in AI/tech stocks
• FOMO levels moderate (Healthy)

**Options Flow (US Markets):**
• Call/Put ratio: 1.18 (Slightly bullish)
• VIX call buying (Hedging activity)
• Tech sector call volume elevated

## 🗓️ **US Market Calendar Impact**
• **This Week**: CPI data, retail sales
• **Next Week**: Fed minutes, jobless claims
• **Earnings Season**: Tech earnings conclude

## 🎯 **US Trading Implications**

✅ **Dip Buying**: US markets showing resilience
✅ **Breakout Potential**: Low VIX supports momentum
✅ **Sector Rotation**: Tech leadership continuing
⚠️ **Fed Watch**: Monitor inflation data closely
⚠️ **Year-End Effects**: Tax loss selling possible

**US Market Sentiment Score**: 7.2/10 (Bullish but measured)
**Best Strategies**: Focus on quality US large-caps with strong earnings`
    }

    // Default conversational response
    return `🤖 **TreadGPT Response**

Thanks for chatting with me! I understand you're asking about "${content}". 

I'm here to help with anything you'd like to discuss:

💬 **General Conversation**: I love talking about life, interests, current events, or just having a friendly chat

📈 **Trading & Finance**: I specialize in market analysis, trading strategies, and investment insights (with a focus on US markets)

🧠 **Learning & Advice**: Happy to share thoughts on personal development, decision-making, or problem-solving

🎯 **Your Interests**: I'm genuinely curious about what matters to you!

**What would you like to explore?**
• Ask me anything - I enjoy both casual conversations and deep discussions
• Share what's on your mind - I'm a good listener
• Let me know your interests and I'll engage meaningfully
• If you want trading insights, just let me know what you're curious about

I'm here to be helpful, informative, and hopefully entertaining too! What's next? 😊`
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const response = generateAdvancedResponse(content)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'analysis',
        metadata: {
          confidence: Math.floor(Math.random() * 30) + 70,
          riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
        }
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt)
  }

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory)

  return (
    <div className="h-full flex flex-col">
      {/* Simplified Header */}
      <div className="p-4 border-b bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TreadGPT</h1>
              <p className="text-sm text-muted-foreground">Your Friendly AI Companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Chat Anything
            </Badge>
          </div>
        </div>
      </div>

      {/* Chat Interface - Main Focus */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Area - Expanded */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card border shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className={message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
                      {message.timestamp.toLocaleTimeString()}
                      {message.metadata?.confidence && (
                        <span className="ml-2">• {message.metadata.confidence}% confidence</span>
                      )}
                    </span>
                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(message.content)}
                        className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-3 rounded-lg bg-card border">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Analyzing US market data...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions - Collapsible */}
        <div className="border-t bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === 'all' ? 'analysis' : 'all')}
              className="text-xs"
            >
              {selectedCategory === 'all' ? 'Show Less' : 'Show All'}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filteredActions.slice(0, selectedCategory === 'all' ? 6 : 3).map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs flex items-center space-x-1"
                >
                  <Icon className="w-3 h-3" />
                  <span>{action.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Input Area - Clean */}
        <div className="p-4 border-t bg-card/50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              placeholder="Say hi, ask anything, or chat about whatever's on your mind..."
              className="flex-1 p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}