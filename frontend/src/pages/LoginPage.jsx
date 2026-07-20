import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    auth.login(email, password)
      .then(function () {
        navigate('/')
      })
      .catch(function (err) {
        setError(err.message || 'Login failed')
      })
      .finally(function () {
        setLoading(false)
      })
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl bg-gradient mx-auto mb-4">D</div>
        <h1 className="font-extrabold text-[26px] mb-1.5">Welcome back</h1>
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Log in to save jobs and track applications</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-7"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-[13px]" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
            {error}
          </div>
        )}

        <label className="block text-[13px] font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={function (e) { setEmail(e.target.value) }}
          placeholder="you@example.com"
          required
          className="w-full mb-4 rounded-lg px-4 py-3 text-[14px] outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />

        <label className="block text-[13px] font-medium mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={function (e) { setPassword(e.target.value) }}
          placeholder="********"
          required
          className="w-full mb-2 rounded-lg px-4 py-3 text-[14px] outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
        <div className="text-right mb-5">
          <a href="#" className="text-[12.5px]" style={{ color: 'var(--accent-purple)' }}>Forgot password?</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-[14.5px] bg-gradient hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="text-center text-[13px] mt-5" style={{ color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </form>
    </div>
  )
}