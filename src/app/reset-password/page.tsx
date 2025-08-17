'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (token) {
      setShowModal(true)
    }
  }, [token])

  const handleCloseModal = () => {
    setShowModal(false)
    // Redirect to home page after closing
    window.location.href = '/'
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or missing the required token.
          </p>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <ResetPasswordModal
        isOpen={showModal}
        onClose={handleCloseModal}
        token={token}
      />
    </div>
  )
}
