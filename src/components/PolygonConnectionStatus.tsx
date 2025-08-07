import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Wifi, WifiOff, Info } from 'lucide-react'
import { polygonAPI } from '@/lib/polygon-api'

interface ConnectionInfo {
  isWebSocketConnected: boolean
  isFreeTier: boolean
  wsAuthenticationFailed: boolean
  connectionAttempts: number
  subscribedSymbols: string[]
  isPolling: boolean
}

interface PolygonConnectionStatusProps {
  className?: string
  showDetails?: boolean
}

export function PolygonConnectionStatus({ className = '', showDetails = false }: PolygonConnectionStatusProps) {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const updateConnectionInfo = () => {
      try {
        const info = polygonAPI.getConnectionInfo()
        setConnectionInfo(info)
      } catch (error) {
        console.error('Error getting connection info:', error)
      }
    }

    // Update immediately
    updateConnectionInfo()

    // Update every 5 seconds
    const interval = setInterval(updateConnectionInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!connectionInfo) {
    return null
  }

  const getStatusIcon = () => {
    if (connectionInfo.isWebSocketConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (connectionInfo.isPolling) {
      return <Wifi className="h-4 w-4 text-blue-500" />
    } else {
      return <WifiOff className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = () => {
    if (connectionInfo.isWebSocketConnected) {
      return '15-min delayed (WebSocket)'
    } else if (connectionInfo.isPolling) {
      return 'Polling (REST API)'
    } else {
      return 'Disconnected'
    }
  }

  const getStatusColor = () => {
    if (connectionInfo.isWebSocketConnected) {
      return 'text-green-600'
    } else if (connectionInfo.isPolling) {
      return 'text-blue-600'
    } else {
      return 'text-red-600'
    }
  }

  const getTierInfo = () => {
    if (connectionInfo.isWebSocketConnected) {
      return {
        tier: '$29 Starter',
        description: '15-minute delayed WebSocket updates',
        color: 'text-orange-600 bg-orange-50 border-orange-200'
      }
    } else if (connectionInfo.isFreeTier || connectionInfo.wsAuthenticationFailed) {
      return {
        tier: 'Free Tier',
        description: 'Using REST API with 15-second updates',
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      }
    } else {
      return {
        tier: 'Unknown',
        description: 'Connection status unclear',
        color: 'text-gray-600 bg-gray-50 border-gray-200'
      }
    }
  }

  const tierInfo = getTierInfo()

  return (
    <div className={`bg-white border rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full border ${tierInfo.color}`}>
            {tierInfo.tier}
          </span>
        </div>
        
        {showDetails && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Info className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDetails && isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="text-xs text-gray-600">
            <div className="font-medium mb-1">Connection Details:</div>
            <div>• Status: {tierInfo.description}</div>
            <div>• Subscribed symbols: {connectionInfo.subscribedSymbols.length}</div>
            {connectionInfo.wsAuthenticationFailed && (
              <div className="flex items-center space-x-1 text-amber-600 mt-2">
                <AlertCircle className="h-3 w-3" />
                <span>WebSocket authentication failed - using REST fallback</span>
              </div>
            )}
            {connectionInfo.connectionAttempts > 0 && (
              <div>• Connection attempts: {connectionInfo.connectionAttempts}</div>
            )}
          </div>
          
          {connectionInfo.isWebSocketConnected && (
            <div className="text-xs p-2 bg-orange-50 border border-orange-200 rounded">
              <div className="font-medium text-orange-800 mb-1">$29 Starter Plan Active</div>
              <div className="text-orange-700">
                WebSocket connected with 15-minute delayed market data. 
                <a 
                  href="https://polygon.io/pricing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:no-underline"
                >
                  Upgrade for real-time data
                </a>
              </div>
            </div>
          )}
          {connectionInfo.isFreeTier && (
            <div className="text-xs p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="font-medium text-blue-800 mb-1">Free Tier Detected</div>
              <div className="text-blue-700">
                Upgrade to a paid Polygon.io subscription for WebSocket updates.
                <a 
                  href="https://polygon.io/pricing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:no-underline"
                >
                  View pricing
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PolygonConnectionStatus