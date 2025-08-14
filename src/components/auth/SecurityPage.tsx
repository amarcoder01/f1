'use client'

import React, { useState } from 'react'
import { 
  Shield, 
  Lock, 
  Key, 
  Smartphone, 
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Save,
  Edit3
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

export function SecurityPage() {
  const { user } = useAuthStore()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailVerification: user?.isEmailVerified || false,
    loginNotifications: true,
    suspiciousActivityAlerts: true
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    )
  }

  const handlePasswordChange = () => {
    // Here you would typically make an API call to change the password
    console.log('Changing password...', passwordData)
    setIsChangingPassword(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const isPasswordValid = passwordData.newPassword.length >= 8 && 
                         passwordData.newPassword === passwordData.confirmPassword &&
                         passwordData.currentPassword.length > 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security</h1>
          <p className="text-gray-600 mt-2">Manage your account security and privacy settings</p>
        </div>

        <div className="space-y-8">
          {/* Password Security */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Lock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Password</h2>
                  <p className="text-sm text-gray-500">Last changed: {new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Change Password</span>
              </Button>
            </div>

            {isChangingPassword && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter your new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={!isPasswordValid}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelPasswordChange}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={securitySettings.twoFactorAuth ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {securitySettings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                </Badge>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                />
              </div>
            </div>

            {securitySettings.twoFactorAuth && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Two-factor authentication is enabled</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Your account is now protected with an additional security layer. You'll need to enter a verification code when signing in from new devices.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Email Verification */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Email Verification</h2>
                  <p className="text-sm text-gray-500">Verify your email address for enhanced security</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={securitySettings.emailVerification ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {securitySettings.emailVerification ? 'Verified' : 'Not Verified'}
                </Badge>
                {!securitySettings.emailVerification && (
                  <Button variant="outline" size="sm">
                    Verify Email
                  </Button>
                )}
              </div>
            </div>

            {securitySettings.emailVerification ? (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">Email address verified</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Your email address {user.email} has been verified. You'll receive important security notifications at this address.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-900">Email address not verified</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please verify your email address to receive important security notifications and protect your account.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Security Notifications</h2>
                <p className="text-sm text-gray-500">Choose which security alerts you want to receive</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Login Notifications</h3>
                  <p className="text-sm text-gray-500">Get notified when someone signs in to your account</p>
                </div>
                <Switch
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Suspicious Activity Alerts</h3>
                  <p className="text-sm text-gray-500">Receive alerts for unusual account activity</p>
                </div>
                <Switch
                  checked={securitySettings.suspiciousActivityAlerts}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, suspiciousActivityAlerts: checked })}
                />
              </div>
            </div>
          </div>

          {/* Account Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Key className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recent Account Activity</h2>
                <p className="text-sm text-gray-500">Monitor your recent sign-ins and account changes</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Successful login</p>
                    <p className="text-xs text-gray-500">From Chrome on Windows • {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Current Session</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Password changed</p>
                    <p className="text-xs text-gray-500">From Chrome on Windows • {new Date(Date.now() - 86400000).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
