'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Store session in localStorage for demo
      if (email && password) {
        localStorage.setItem('adminSession', JSON.stringify({ email, timestamp: Date.now() }))
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#1a1a1a] hairline p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-[#c89b5c] text-balance">LEO WORLD</h1>
          <p className="text-body-small text-[#a8a8a8] mt-2">Complete Business Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-body-small font-medium text-foreground block">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@leoworld.com"
              className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] transition-colors"
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-body-small font-medium text-foreground block">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#0a0a0a] hairline text-foreground placeholder-[#707070] rounded-none focus:outline-none focus:ring-1 focus:ring-[#c89b5c] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a8a8] hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="text-[#a85c5c] text-body-small">{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#c89b5c] text-[#0a0a0a] font-medium rounded-none hover:bg-[#e8c989] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Demo Note */}
          <p className="text-body-small text-[#707070] text-center">
            Demo: Use any email and password to login
          </p>
        </form>
      </div>

      {/* Footer */}
      <p className="text-body-small text-[#707070] text-center mt-6">
        © 2024 LEO WORLD. All rights reserved.
      </p>
    </div>
  )
}
