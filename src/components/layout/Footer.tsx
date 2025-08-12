'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube,
  ArrowUp,
  Shield,
  Lock,
  Users,
  TrendingUp,
  BarChart3,
  Globe,
  FileText,
  HelpCircle,
  MessageCircle
} from 'lucide-react'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email)
    setEmail('')
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">TreadGPT</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your advanced AI-powered trading assistant. Get real-time market data, 
              intelligent analysis, and expert insights to make informed trading decisions.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Trading Tools */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Trading Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/treadgpt" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  AI Chat Assistant
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Live Dashboard
                </Link>
              </li>
              <li>
                <Link href="/charts" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Stock Charts
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Portfolio Tracker
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Market News
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support & Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Trading Tutorials
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Community Forum
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
            <p className="text-gray-300 text-sm">
              Get the latest market insights and trading tips delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-md text-white text-sm font-medium transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </form>
            
            {/* Contact Info */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center text-sm text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span>contact.support.vidality@gmail.com</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Legal Links */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">Legal</h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Risk Disclaimer
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">Company</h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-blue-500 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Press Room
                  </Link>
                </li>
                <li>
                  <Link href="/partners" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>

            {/* Trading Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">Trading</h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="/markets" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Markets
                  </Link>
                </li>
                <li>
                  <Link href="/fees" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Fee Schedule
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Links */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">Contact</h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="mailto:contact.support.vidality@gmail.com" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="mailto:amar@vidality.com" className="text-gray-400 hover:text-blue-500 transition-colors">
                    General Inquiries
                  </Link>
                </li>
                <li>
                  <Link href="mailto:info.vidality@gmail.com" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Information
                  </Link>
                </li>
                <li>
                  <Link href="mailto:privacy.vidality@gmail.com" className="text-gray-400 hover:text-blue-500 transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>© 2024 TreadGPT. All rights reserved.</span>
              <span>•</span>
              <span>Vidality Trading Platform</span>
              <span>•</span>
              <span>Regulated by SEC</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="h-4 w-4" />
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Lock className="h-4 w-4" />
                <span>SOC 2 Type II Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  )
}
