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
  Settings,
  MessageSquare,
  Zap as ZapIcon
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AIChatMessage } from '@/types'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'

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
    id: 'stock-price',
    label: 'Stock Price',
    icon: TrendingUp,
    prompt: "What's the current price of AAPL?",
    category: 'analysis',
    description: 'Get real-time stock prices'
  },
  {
    id: 'market-sentiment',
    label: 'Market Sentiment',
    icon: Globe,
    prompt: 'Analyze the current market sentiment and key indices',
    category: 'analysis',
    description: 'Understand market psychology'
  },
  {
    id: 'trading-strategy',
    label: 'Trading Strategy',
    icon: Target,
    prompt: 'Give me a trading strategy for TSLA with entry, stop loss, and targets',
    category: 'strategy',
    description: 'AI-generated trading strategies'
  },
  {
    id: 'technical-analysis',
    label: 'Technical Analysis',
    icon: BarChart3,
    prompt: 'Perform a technical analysis of MSFT with key indicators',
    category: 'analysis',
    description: 'Advanced technical analysis'
  },
  {
    id: 'company-research',
    label: 'Company Research',
    icon: BookOpen,
    prompt: 'Tell me about GOOGL company fundamentals and recent news',
    category: 'education',
    description: 'Comprehensive company research'
  },
  {
    id: 'risk-assessment',
    label: 'Risk Assessment',
    icon: Shield,
    prompt: 'Assess the risk level for investing in NVDA right now',
    category: 'alerts',
    description: 'Risk analysis and warnings'
  }
]

export default function TreadGPTPage() {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 **Welcome to TreadGPT - Your AI Trading Assistant!**

I'm your advanced AI companion with real-time access to stock market data. I can help you with:

**📈 Trading & Analysis:**
• Real-time stock prices and market data
• Technical analysis with key indicators
• Trading strategies and risk assessment
• Market sentiment and trend analysis

**💬 General Conversation:**
• Chat about anything - life, interests, current events
• Answer questions about trading and markets
• Provide insights and analysis on any topic

**🎯 What I Can Do:**
• Fetch live stock data using my built-in tools
• Analyze market conditions and trends
• Generate personalized trading strategies
• Research companies and fundamentals
• Engage in natural conversation like ChatGPT

**Try asking me:**
• "What's the current price of AAPL?"
• "Analyze the market sentiment today"
• "Give me a trading strategy for TSLA"
• "Tell me about your capabilities"

I'm here to help with both trading and casual conversation! What would you like to explore? 😊`,
      timestamp: new Date(),
      metadata: {
        confidence: 95,
        riskLevel: 'low',
        responseType: 'text'
      }
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

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Call AI chat API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: AIChatMessage = {
        ...data.message,
        timestamp: new Date(data.message.timestamp)
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Chat error:', error)
      
      // Fallback response
      const fallbackMessage: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error processing your request. This might be due to:

• Missing OpenAI API key configuration
• Network connectivity issues
• API rate limiting

**To fix this:**
1. Check that OPENAI_API_KEY is set in your environment
2. Ensure you have a valid OpenAI API key
3. Try again in a few moments

For now, you can still use the quick actions below to explore trading features! 😊`,
        timestamp: new Date(),
        metadata: {
          confidence: 50,
          riskLevel: 'low',
          responseType: 'text'
        }
      }

      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    setInputValue(action.prompt)
    handleSendMessage(action.prompt)
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    // You could add a toast notification here
  }

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory)

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header */}
      <div className="p-4 border-b bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TreadGPT</h1>
              <p className="text-sm text-muted-foreground">AI Trading Assistant with Real-time Data</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              GPT-4o Powered
            </Badge>
            <Badge variant="outline" className="text-xs">
              <ZapIcon className="w-3 h-3 mr-1" />
              Real-time Data
            </Badge>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onCopy={handleCopyMessage}
              />
            ))}
          </AnimatePresence>
          
          {/* Loading Indicator */}
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
                    <span className="text-sm text-muted-foreground">Analyzing with AI...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="border-t bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="text-xs border border-border rounded px-2 py-1 bg-background"
              >
                <option value="all">All</option>
                <option value="analysis">Analysis</option>
                <option value="strategy">Strategy</option>
                <option value="education">Education</option>
                <option value="alerts">Alerts</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filteredActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs flex items-center space-x-1"
                  disabled={isLoading}
                >
                  <Icon className="w-3 h-3" />
                  <span>{action.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Enhanced Input */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={() => handleSendMessage(inputValue)}
          isLoading={isLoading}
          placeholder="Ask me anything about trading, stocks, or just chat..."
        />
      </div>
    </div>
  )
}