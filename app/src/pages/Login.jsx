import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleEmailCheck = async (e) => {
    e.preventDefault()
    if (!email) return

    setError('')
    setLoading(true)

    try {
      // Check if email exists and needs password setup
      const response = await api.post('/auth/check-email', { email })
      console.log('Check email response:', response.data)
      const { requiresPasswordSetup } = response.data

      // If user needs to set password, redirect to setup page
      if (requiresPasswordSetup) {
        navigate('/set-password', { state: { email } })
        return
      }

      // Otherwise, show password field for login
      setShowPassword(true)
      setEmailVerified(true)
    } catch (err) {
      console.error('Check email error:', err)
      console.error('Error response:', err.response)
      setError(err.response?.data?.error || err.message || 'Email not found')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)
      
      if (data.user.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (showPassword) {
      // Reset if user changes email
      setShowPassword(false)
      setEmailVerified(false)
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F5F1E8] relative overflow-hidden">
      {/* Logo/Brand Name */}
      <div className="absolute top-8 left-8 z-20">
        <h2 className="text-2xl font-bold text-gray-900">PostFlow</h2>
      </div>

      {/* Left Side - Description */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#FFD9A8] rounded-3xl opacity-70"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 border-2 border-gray-300 rounded-lg opacity-50"></div>
        
        {/* Abstract Decorative Lines */}
        <svg className="absolute top-40 left-1/4 w-32 h-16 opacity-30" viewBox="0 0 100 50">
          <path d="M 0 25 Q 25 0, 50 25 T 100 25" stroke="#333" strokeWidth="2" fill="none"/>
        </svg>
        <svg className="absolute bottom-32 right-1/4 w-32 h-16 opacity-30" viewBox="0 0 100 50">
          <path d="M 0 25 Q 25 50, 50 25 T 100 25" stroke="#333" strokeWidth="2" fill="none"/>
        </svg>

        {/* Description Content */}
        <div className="max-w-lg relative z-10">
          <div className="mb-8">
            <div className="w-16 h-16 bg-[#FFB366] rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to PostFlow</h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-6 font-typewriter">
              A streamlined platform for creating, managing, and publishing content with seamless approval workflows.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#FFB366] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-700 font-typewriter">Create and submit posts for review</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#FFB366] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-700 font-typewriter">Track your content approval status</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#FFB366] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-700 font-typewriter">Get instant feedback from administrators</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Decorative Elements for mobile */}
        <div className="lg:hidden absolute top-10 right-10 w-24 h-24 bg-[#FFD9A8] rounded-3xl opacity-70"></div>
        <div className="lg:hidden absolute bottom-10 left-10 w-20 h-20 border-2 border-gray-300 rounded-lg opacity-50"></div>

        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md relative z-10">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">User Login</h1>
        <p className="text-center text-sm text-gray-600 mb-8">
          Hey, Enter your details to get sign in<br/>to your account
        </p>
        
        <form onSubmit={showPassword ? handleLogin : handleEmailCheck} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              autoComplete="email"
              disabled={emailVerified}
              placeholder="nimdiejackson@gmail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400"
            />
            {emailVerified && (
              <button
                type="button"
                onClick={() => {
                  setShowPassword(false)
                  setEmailVerified(false)
                  setPassword('')
                  setError('')
                }}
                className="text-[#FFB366] text-sm hover:underline mt-2 font-medium"
              >
                Change email
              </button>
            )}
          </div>

          {showPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passcode</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                autoFocus
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFB366] hover:bg-[#FFA347] disabled:bg-[#FFD9A8] text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? (showPassword ? 'Signing in...' : 'Checking...') : (showPassword ? 'Sign in' : 'Continue')}
          </button>

          {/* Decorative divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">Or sign in with</span>
            </div>
          </div>

          {/* Social Login Options (visual only) */}
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm text-gray-700">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000"/>
              </svg>
              <span className="text-sm text-gray-700">Apple ID</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600">
            Don't have an account? <span className="text-[#FFB366] font-medium cursor-not-allowed">Request Now</span>
          </p>
        </div>
      </div>
      
      {/* Footer Copyright */}
      <div className="absolute bottom-4 right-8 lg:right-auto lg:left-1/2 lg:transform lg:-translate-x-1/2">
        <p className="text-xs text-gray-600">
          Copyright @postflow 2025 | <span className="text-gray-800 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
      </div>
    </div>
  )
}

export default Login
