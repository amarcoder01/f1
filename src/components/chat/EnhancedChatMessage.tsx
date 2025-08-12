'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Bot, 
  Copy, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  Calculator,
  Shield,
  Zap,
  Eye,
  EyeOff,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AIChatMessage } from '@/types'
import ReactMarkdown from 'react-markdown'

interface EnhancedChatMessageProps {
  message: AIChatMessage
  onCopy?: (content: string) => void
  isStreaming?: boolean
  streamContent?: string
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void
  onAction?: (action: string, data?: any) => void
}

export function EnhancedChatMessage({ 
  message, 
  onCopy, 
  isStreaming = false, 
  streamContent = '',
  onFeedback,
  onAction
}: EnhancedChatMessageProps) {
  const [displayContent, setDisplayContent] = useState(message.content)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
  
  const isUser = message.role === 'user'
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0
  const hasToolResults = message.toolResults && message.toolResults.length > 0
  const hasMetadata = message.metadata && Object.keys(message.metadata).length > 0

  // Handle streaming content updates
  useEffect(() => {
    if (isStreaming && streamContent) {
      setDisplayContent(streamContent)
    } else {
      setDisplayContent(message.content)
    }
  }, [message.content, isStreaming, streamContent])

  const handleCopy = () => {
    if (onCopy) {
      onCopy(displayContent)
    } else {
      navigator.clipboard.writeText(displayContent)
    }
  }

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type)
    onFeedback?.(message.id, type)
  }

  const handleAction = (action: string, data?: any) => {
    onAction?.(action, data)
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-500'
    if (confidence >= 80) return 'bg-green-500'
    if (confidence >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getResponseTypeIcon = (responseType?: string) => {
    switch (responseType) {
      case 'chart': return <BarChart3 className="w-4 h-4" />
      case 'table': return <Calculator className="w-4 h-4" />
      case 'code': return <Zap className="w-4 h-4" />
      case 'alert': return <AlertTriangle className="w-4 h-4" />
      case 'strategy': return <Shield className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const renderToolCalls = () => {
    if (!hasToolCalls) return null

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Fetching Data...</span>
        </div>
        <div className="space-y-1">
          {message.toolCalls?.map((toolCall, index) => (
            <div key={index} className="text-xs text-blue-600">
              • {toolCall.function?.name || 'Unknown tool'}
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  const renderToolResults = () => {
    if (!hasToolResults) return null

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg"
      >
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Data Retrieved</span>
        </div>
        <div className="space-y-1">
          {message.toolResults?.map((result, index) => (
            <div key={index} className="text-xs text-green-600">
              • {result.toolCallId} - {result.content.substring(0, 50)}...
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  const renderMetadata = () => {
    if (!hasMetadata) return null

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-2 space-y-2"
      >
        {/* Confidence Indicator */}
        {message.metadata?.confidence && (
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(message.metadata.confidence)}`} />
            <span className="text-xs text-muted-foreground">
              {message.metadata.confidence}% confidence
            </span>
          </div>
        )}

        {/* Risk Level Badge */}
        {message.metadata?.riskLevel && (
          <Badge variant="outline" className={`text-xs ${getRiskLevelColor(message.metadata.riskLevel)}`}>
            {message.metadata.riskLevel} risk
          </Badge>
        )}

        {/* Response Type Badge */}
        {message.metadata?.responseType && message.metadata.responseType !== 'text' && (
          <Badge variant="outline" className="text-xs flex items-center space-x-1">
            {getResponseTypeIcon(message.metadata.responseType)}
            <span>{message.metadata.responseType}</span>
          </Badge>
        )}

        {/* Timeframe */}
        {message.metadata?.timeframe && (
          <Badge variant="outline" className="text-xs">
            {message.metadata.timeframe}
          </Badge>
        )}
      </motion.div>
    )
  }

  const renderInteractiveElements = () => {
    if (isUser) return null

    const elements: React.ReactNode[] = []

    // Add chart button if response contains chart data
    if (displayContent.toLowerCase().includes('chart') || displayContent.toLowerCase().includes('technical')) {
      elements.push(
        <Button
          key="chart"
          variant="outline"
          size="sm"
          onClick={() => handleAction('show_chart', { symbol: 'AAPL' })}
          className="text-xs"
        >
          <BarChart3 className="w-3 h-3 mr-1" />
          View Chart
        </Button>
      )
    }

    // Add analysis button if response contains analysis
    if (displayContent.toLowerCase().includes('analysis') || displayContent.toLowerCase().includes('indicator')) {
      elements.push(
        <Button
          key="analysis"
          variant="outline"
          size="sm"
          onClick={() => handleAction('deep_analysis', { content: displayContent })}
          className="text-xs"
        >
          <Calculator className="w-3 h-3 mr-1" />
          Deep Analysis
        </Button>
      )
    }

    // Add strategy button if response contains strategy
    if (displayContent.toLowerCase().includes('strategy') || displayContent.toLowerCase().includes('trade')) {
      elements.push(
        <Button
          key="strategy"
          variant="outline"
          size="sm"
          onClick={() => handleAction('backtest_strategy', { content: displayContent })}
          className="text-xs"
        >
          <Shield className="w-3 h-3 mr-1" />
          Backtest
        </Button>
      )
    }

    return elements.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-3">
        {elements}
      </div>
    ) : null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start space-x-3 max-w-[85%] ${
        isUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message Content */}
        <div className={`p-4 rounded-lg ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border shadow-sm'
        }`}>
          {/* Message Content */}
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  return (
                    <code className={`${className} bg-muted px-1 py-0.5 rounded text-sm`} {...props}>
                      {children}
                    </code>
                  )
                },
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                p: ({ children }) => <p className="mb-2">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic bg-muted/50 py-2 rounded-r">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>

          {/* Streaming indicator */}
          {isStreaming && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">AI is typing...</span>
            </div>
          )}

          {/* Tool Calls */}
          {renderToolCalls()}

          {/* Tool Results */}
          {renderToolResults()}

          {/* Metadata */}
          {renderMetadata()}

          {/* Interactive Elements */}
          {renderInteractiveElements()}

          {/* Message Footer */}
          <div className="flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className={isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>

            {/* Action Buttons */}
            {!isUser && (
              <div className="flex items-center space-x-1">
                {/* Copy Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                >
                  <Copy className="w-3 h-3" />
                </Button>

                {/* Feedback Buttons */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('positive')}
                  className={`h-6 w-6 p-0 ${feedback === 'positive' ? 'text-green-500' : 'opacity-60 hover:opacity-100'}`}
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('negative')}
                  className={`h-6 w-6 p-0 ${feedback === 'negative' ? 'text-red-500' : 'opacity-60 hover:opacity-100'}`}
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>

                {/* Details Toggle */}
                {hasMetadata && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  >
                    {showDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {showDetails && hasMetadata && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-muted/50 rounded-lg"
              >
                <h4 className="text-xs font-semibold mb-2">Message Details</h4>
                <pre className="text-xs text-muted-foreground overflow-auto">
                  {JSON.stringify(message.metadata, null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
