import { Metadata } from 'next'
import { Shield, AlertTriangle, FileText, Users, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service - Vidality Trading Platform',
  description: 'Terms of Service for Vidality, the professional trading platform. Read our terms and conditions for using our services.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              1. Introduction
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Welcome to Vidality ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our 
                trading platform, website, and services (collectively, the "Service").
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part 
                of these terms, then you may not access the Service.
              </p>
            </div>
          </section>

          {/* Definitions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Definitions</h2>
            <div className="text-gray-700 space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>"Service"</strong> refers to the Vidality trading platform, website, and all related services.</li>
                <li><strong>"User," "you," and "your"</strong> refers to you, as the user of the Service.</li>
                <li><strong>"Account"</strong> means the account you create to access our Service.</li>
                <li><strong>"Content"</strong> refers to text, images, or other information that can be posted, uploaded, linked to or otherwise made available via the Service.</li>
              </ul>
            </div>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 mr-2 text-green-600" />
              3. Account Registration
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                To use certain features of our Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept all risks of unauthorized access to your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-yellow-600" />
              4. Acceptable Use Policy
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to manipulate market data or engage in market manipulation</li>
              </ul>
            </div>
          </section>

          {/* Risk Disclosure */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              5. Risk Disclosure
            </h2>
            <div className="text-gray-700 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-semibold text-red-800 mb-2">Important Risk Warning:</p>
                <p className="text-red-700">
                  Trading in financial markets involves substantial risk of loss and is not suitable for all investors. 
                  The value of investments can go down as well as up, and you may lose some or all of your invested capital.
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li>Past performance does not guarantee future results</li>
                <li>Market data and analysis are for informational purposes only</li>
                <li>We do not provide investment advice or recommendations</li>
                <li>You should consult with a qualified financial advisor before making investment decisions</li>
                <li>Paper trading results may not reflect actual trading performance</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="h-6 w-6 mr-2 text-purple-600" />
              6. Privacy and Data Protection
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our 
                Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p>
                By using our Service, you consent to the collection and use of your information as described in our 
                Privacy Policy.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property Rights</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive 
                property of Vidality and its licensors. The Service is protected by copyright, trademark, and other 
                laws.
              </p>
              <p>
                Our trademarks and trade dress may not be used in connection with any product or service without our 
                prior written consent.
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. VIDALITY DISCLAIMS ALL WARRANTIES, 
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Warranties of merchantability and fitness for a particular purpose</li>
                <li>Warranties that the Service will be uninterrupted or error-free</li>
                <li>Warranties regarding the accuracy or reliability of market data</li>
                <li>Warranties that defects will be corrected</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                IN NO EVENT SHALL VIDALITY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR 
                PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER 
                INTANGIBLE LOSSES.
              </p>
              <p>
                OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM THE USE OF THE SERVICE SHALL NOT EXCEED 
                THE AMOUNT PAID BY YOU, IF ANY, FOR ACCESSING THE SERVICE.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior 
                notice or liability, under our sole discretion, for any reason whatsoever.
              </p>
              <p>
                Upon termination, your right to use the Service will cease immediately. If you wish to terminate 
                your account, you may simply discontinue using the Service.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                These Terms shall be interpreted and governed by the laws of the United States, without regard to 
                its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or the Service shall be resolved in the courts of the United States.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p>
                What constitutes a material change will be determined at our sole discretion. By continuing to access 
                or use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Email:</strong> <a href="mailto:amar@vidality.com" className="text-blue-600 hover:text-blue-800">amar@vidality.com</a></p>
                <p><strong>Address:</strong> New York, NY</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
