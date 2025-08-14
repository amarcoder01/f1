'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  Shield, 
  ArrowUp,
  Lock,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { VidalityLogo } from '@/components/ui/VidalityLogo'

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-start space-y-8 lg:space-y-0 lg:space-x-12">
          
          {/* Legal Section */}
          <div className="flex-1 max-w-md">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Legal Information
                </h3>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed">
                Important legal documents and policies that govern your use of our trading platform.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link 
                  href="/terms" 
                  className="group flex items-center space-x-2 text-slate-300 hover:text-red-400 transition-all duration-300 p-2 rounded-lg hover:bg-slate-800/50"
                >
                  <span className="text-sm font-medium">Terms of Service</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                
                <Link 
                  href="/privacy" 
                  className="group flex items-center space-x-2 text-slate-300 hover:text-red-400 transition-all duration-300 p-2 rounded-lg hover:bg-slate-800/50"
                >
                  <span className="text-sm font-medium">Privacy Policy</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                
                <Link 
                  href="/cookies" 
                  className="group flex items-center space-x-2 text-slate-300 hover:text-red-400 transition-all duration-300 p-2 rounded-lg hover:bg-slate-800/50"
                >
                  <span className="text-sm font-medium">Cookie Policy</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                
                <Link 
                  href="/disclaimer" 
                  className="group flex items-center space-x-2 text-slate-300 hover:text-red-400 transition-all duration-300 p-2 rounded-lg hover:bg-slate-800/50"
                >
                  <span className="text-sm font-medium">Risk Disclosure</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                
                <Link 
                  href="/regulatory" 
                  className="group flex items-center space-x-2 text-slate-300 hover:text-red-400 transition-all duration-300 p-2 rounded-lg hover:bg-slate-800/50 sm:col-span-2"
                >
                  <span className="text-sm font-medium">Regulatory Information</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>

          {/* Platform Info */}
          <div className="flex-1 max-w-md">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Platform Security
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">SSL Secured</p>
                    <p className="text-xs text-slate-400">256-bit encryption</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">SOC 2 Compliant</p>
                    <p className="text-xs text-slate-400">Type II certified</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <div className="bg-yellow-500/20 p-2 rounded-lg">
                    <Lock className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">SEC Registered</p>
                    <p className="text-xs text-slate-400">Regulated platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
                <VidalityLogo size="sm" variant="minimal" className="text-white" />
              </div>
              <p className="text-sm text-slate-400">
                © 2024 <span className="font-semibold text-white">Vidality Trading Platform</span>. All rights reserved.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Professional trading solutions for modern investors
              </p>
            </div>

                         {/* Version Info */}
             <div className="text-center lg:text-right">
               <p className="text-xs text-slate-500">
                 Platform Version: <span className="text-slate-400 font-mono">v1.0.0</span>
               </p>
               <p className="text-xs text-slate-500 mt-1">
                 Last updated: December 2024
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
      </button>
    </footer>
  )
}
