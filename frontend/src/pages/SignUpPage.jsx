import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()

  function update(key, val) {
    setForm(function (f) {
      const copy = { ...f }
      copy[key] = val
      return copy
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    console.log('Form submitted, auth object is:', auth)
    setError('')
    setLoading(true)

    auth.signup(form.name, form.email, form.password)
      .then(function () {
        console.log('Signup succeeded')
        navigate('/')
      })
      .catch(function (err) {
        console.log('Signup failed:', err)
        setError(err.message || 'Signup failed')
      })
      .finally(function () {
        setLoading(false)
      })
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-2xl bg-gradient mx-auto mb-4">D</div>
        <h1 className="font-extrabold text-[26px] mb-1.5">Create your account</h1>
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Get matched with data roles that fit you</p>
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

        <label className="block text-[13px] font-medium mb-2">Full name</label>
        <input
          value={form.name}
          onChange={function (e) { update('name', e.target.value) }}
          placeholder="Sneha Arora"
          required
          className="w-full mb-4 rounded-lg px-4 py-3 text-[14px] outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />

        <label className="block text-[13px] font-medium mb-2">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={function (e) { update('email', e.target.value) }}
          placeholder="you@example.com"
          required
          className="w-full mb-4 rounded-lg px-4 py-3 text-[14px] outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />

        <label className="block text-[13px] font-medium mb-2">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={function (e) { update('password', e.target.value) }}
          placeholder="At least 6 characters"
          required
          className="w-full mb-5 rounded-lg px-4 py-3 text-[14px] outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-[14.5px] bg-gradient hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-center text-[13px] mt-5" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Log in</Link>
        </p>
      </form>
    </div>
  )
}