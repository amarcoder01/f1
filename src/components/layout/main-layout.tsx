'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useUIStore } from '@/store'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 