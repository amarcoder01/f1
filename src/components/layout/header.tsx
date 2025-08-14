'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  Sun, 
  Moon, 
  Monitor,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore, useSettingsStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { VidalityLogo } from '@/components/ui/VidalityLogo'

export function Header() {
  const { theme, setTheme, notifications } = useUIStore()
  const { settings } = useSettingsStore()

  const unreadNotifications = notifications.filter(n => !n.read).length

  const handleThemeToggle = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'dark':
        return <Moon className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-card border-b border-border flex items-center justify-between px-6"
    >
      {/* Left Section - Logo and Search */}
      <div className="flex items-center space-x-6">
        {/* Logo */}
        <VidalityLogo size="lg" className="cursor-pointer" />
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search symbols, news, or analysis..."
            className="pl-10 pr-4 py-2 w-80 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Center Section - Market Status */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-600">Market Open</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">+2.34%</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">-1.12%</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-sm text-muted-foreground">Live Data</span>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleThemeToggle}
          className="relative"
        >
          {getThemeIcon()}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </Badge>
          )}
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* Authentication */}
        <div className="flex items-center space-x-3 pl-3 border-l border-border">
          <AuthProvider />
        </div>
      </div>
    </motion.header>
  )
} 