import { Metadata } from 'next'
import { Shield, Lock, Eye, Database, Users, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy - Vidality Trading Platform',
  description: 'Privacy Policy for Vidality trading platform. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
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
              <Lock className="h-6 w-6 mr-2 text-green-600" />
              1. Introduction
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                At Vidality ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security 
                of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you use our trading platform and services.
              </p>
              <p>
                By using our Service, you consent to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="h-6 w-6 mr-2 text-blue-600" />
              2. Information We Collect
            </h2>
            <div className="text-gray-700 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              <p>We may collect the following personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and contact information (email address, phone number)</li>
                <li>Account credentials and profile information</li>
                <li>Financial information (for payment processing)</li>
                <li>Identity verification documents</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mt-6">Usage Information</h3>
              <p>We automatically collect certain information about your use of our Service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and features used</li>
                <li>Time spent on the platform</li>
                <li>Error logs and performance data</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mt-6">Trading Data</h3>
              <p>We may collect information related to your trading activities:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Watchlists and portfolio information</li>
                <li>Trading preferences and strategies</li>
                <li>Market data usage patterns</li>
                <li>Paper trading activities</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="h-6 w-6 mr-2 text-purple-600" />
              3. How We Use Your Information
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our trading platform and services</li>
                <li>Process transactions and manage your account</li>
                <li>Send you important updates and notifications</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 mr-2 text-orange-600" />
              4. Information Sharing and Disclosure
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
              
              <h3 className="text-lg font-medium text-gray-900 mt-4">Service Providers</h3>
              <p>We may share information with trusted third-party service providers who assist us in:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment processing and financial services</li>
                <li>Data storage and cloud hosting</li>
                <li>Analytics and performance monitoring</li>
                <li>Customer support services</li>
                <li>Marketing and communication services</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mt-4">Legal Requirements</h3>
              <p>We may disclose your information if required by law or in response to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Legal process or court orders</li>
                <li>Government requests or investigations</li>
                <li>Regulatory compliance requirements</li>
                <li>Protection of our rights and property</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mt-4">Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                as part of the transaction, subject to the same privacy protections.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-red-600" />
              5. Data Security
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>256-bit SSL encryption for data transmission</li>
                <li>Secure data centers with physical and digital security</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="font-semibold text-green-800 mb-2">Security Certifications:</p>
                <ul className="text-green-700 space-y-1">
                  <li>• SOC 2 Type II Certified</li>
                  <li>• PCI DSS Compliant</li>
                  <li>• GDPR Compliant</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We retain your personal information for as long as necessary to provide our services and 
                comply with legal obligations. The retention period depends on the type of information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Retained while your account is active and for 7 years after closure</li>
                <li><strong>Transaction Records:</strong> Retained for 7 years for regulatory compliance</li>
                <li><strong>Usage Data:</strong> Retained for 2 years for analytics and improvement</li>
                <li><strong>Marketing Data:</strong> Retained until you opt out or for 3 years</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
            <div className="text-gray-700 space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for marketing communications</li>
              </ul>
              <p>
                To exercise these rights, please contact us at{' '}
                <a href="mailto:amar@vidality.com" className="text-blue-600 hover:text-blue-800">
                  amar@vidality.com
                </a>
              </p>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Deliver relevant advertisements</li>
              </ul>
              <p>
                You can control cookie settings through your browser preferences. However, disabling certain 
                cookies may affect platform functionality.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Our platform may contain links to third-party websites or integrate with third-party services. 
                We are not responsible for the privacy practices of these external services.
              </p>
              <p>
                When you use third-party services through our platform, their privacy policies will govern 
                how your information is handled.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Our Service is not intended for children under the age of 18. We do not knowingly collect 
                personal information from children under 18.
              </p>
              <p>
                If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us immediately.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your information during such transfers.
              </p>
              <p>
                For users in the European Union, we comply with GDPR requirements for international data transfers.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
              <p>
                We encourage you to review this Privacy Policy periodically to stay informed about how we 
                protect your information.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-6 w-6 mr-2 text-blue-600" />
              13. Contact Us
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Email:</strong> <a href="mailto:amar@vidality.com" className="text-blue-600 hover:text-blue-800">amar@vidality.com</a></p>
                <p><strong>Address:</strong> New York, NY</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
              <p>
                For privacy-related inquiries, we will respond within 30 days of receiving your request.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
