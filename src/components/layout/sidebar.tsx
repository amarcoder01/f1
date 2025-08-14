'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Bot,
  Globe,
  Search,
  BarChart3,
  Play,
  Wrench,
  TrendingUp,
  Newspaper,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore, useNewsStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VidalityLogo, VidalityLogoCompact } from '@/components/ui/VidalityLogo'

interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: string
  description?: string
}



export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore()
  const { unreadCount } = useNewsStore()
  const router = useRouter()
  const pathname = usePathname()

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/',
      description: 'Overview of your trading activity'
    },
    {
      id: 'market',
      label: 'Market Explorer',
      icon: BarChart3,
      href: '/market',
      description: 'Search stocks and analyze markets'
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: Eye,
      href: '/watchlist',
      description: 'Track your favorite assets'
    },
    {
      id: 'news',
      label: 'Market News',
      icon: Newspaper,
      href: '/news',
      description: 'Real-time news and market insights',
      badge: unreadCount > 0 ? `${unreadCount}` : 'LIVE'
    },
    {
      id: 'price-alerts',
      label: 'Price Alerts',
      icon: Bell,
      href: '/price-alerts',
      description: 'Set up price alerts and notifications'
    },
    {
      id: 'paper-trading',
      label: 'Paper Trading',
      icon: Play,
      href: '/paper-trading',
      description: 'Practice trading with virtual money',
      badge: 'NEW'
    },
    {
      id: 'treadgpt',
      label: 'TreadGPT Chat',
      icon: Bot,
      href: '/treadgpt',
      description: 'AI-powered trading assistant',
      badge: 'AI'
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: Wrench,
      href: '/tools',
      description: 'Professional backtesting and strategy analysis',
      badge: 'BACKTEST'
    },
    {
      id: 'advanced-charts',
      label: 'Advanced Charts',
      icon: TrendingUp,
      href: '/advanced-charts',
      description: 'Professional charting with 50+ indicators',
      badge: 'PRO'
    }
  ]

  const handleItemClick = (href: string) => {
    router.push(href)
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarCollapsed ? 70 : 280 }}
      className="h-screen bg-card border-r border-border flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center space-x-2"
            >
              <VidalityLogo size="md" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center"
            >
              <VidalityLogoCompact />
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="ml-auto"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => handleItemClick(item.href)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 flex items-center justify-between"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{item.label}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground/70 truncate max-w-[180px]">
                              {item.description}
                            </span>
                          )}
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-center"
            >
              <p className="text-xs text-muted-foreground">
                TradingPro Platform
              </p>
              <p className="text-xs text-muted-foreground/70">
                v1.0.0
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
} 