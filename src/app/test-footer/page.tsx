'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestFooterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Footer Test Page</h1>
          <p className="text-lg text-gray-600">
            Scroll down to see the comprehensive footer in action
          </p>
        </div>

        {/* Test Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-blue-600">🏢</span>
                <span>Company Information</span>
              </CardTitle>
              <CardDescription>
                TreadGPT branding and social media links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                The footer includes company branding, description, and social media links.
              </p>
            </CardContent>
          </Card>

          {/* Trading Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-green-600">📈</span>
                <span>Trading Tools</span>
              </CardTitle>
              <CardDescription>
                Links to AI Chat, Dashboard, Charts, Portfolio, and News
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Quick access to all trading tools and features.
              </p>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-purple-600">🛠️</span>
                <span>Support & Resources</span>
              </CardTitle>
              <CardDescription>
                Help Center, Tutorials, API Docs, Community, Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Comprehensive support and resource links.
              </p>
            </CardContent>
          </Card>

          {/* Newsletter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-orange-600">📧</span>
                <span>Newsletter</span>
              </CardTitle>
              <CardDescription>
                Email subscription with validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Stay updated with market insights and trading tips.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-red-600">📞</span>
                <span>Contact Information</span>
              </CardTitle>
              <CardDescription>
                All provided email addresses integrated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Support, General, Info, and Privacy email contacts.
              </p>
            </CardContent>
          </Card>

          {/* Legal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-gray-600">⚖️</span>
                <span>Legal & Compliance</span>
              </CardTitle>
              <CardDescription>
                Terms, Privacy, Cookies, Risk Disclaimer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                All necessary legal pages and compliance links.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scroll Instructions */}
        <div className="text-center space-y-4 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Footer Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">✅ Included Features:</h3>
              <ul className="space-y-1">
                <li>• Professional dark theme design</li>
                <li>• Responsive grid layout</li>
                <li>• Social media integration</li>
                <li>• Newsletter subscription form</li>
                <li>• All contact email addresses</li>
                <li>• Legal compliance links</li>
                <li>• Security and trust badges</li>
                <li>• Scroll to top button</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🎯 Production Ready:</h3>
              <ul className="space-y-1">
                <li>• Mobile optimized</li>
                <li>• Accessibility compliant</li>
                <li>• SEO friendly</li>
                <li>• Performance optimized</li>
                <li>• Easy to customize</li>
                <li>• Analytics ready</li>
                <li>• Professional branding</li>
                <li>• Industry standard</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Spacer for Footer */}
        <div className="h-32 bg-gradient-to-t from-gray-100 to-transparent rounded-lg flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-4xl">⬇️</div>
            <p className="text-gray-600 font-medium">Scroll down to see the footer</p>
          </div>
        </div>

      </div>
    </div>
  )
}
