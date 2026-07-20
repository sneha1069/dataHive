import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchCompanies } from '../services/api'
import { getCompanyMeta } from '../utils/jobDisplay'

export default function FeaturedCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    let cancelled = false
    fetchCompanies()
      .then(function (data) {
        if (cancelled) return
        const merged = data.companies
          .map(function (c) {
            const meta = getCompanyMeta(c.name)
            return { ...meta, name: c.name, roles: c.roles }
          })
          .sort(function (a, b) { return b.roles - a.roles })
          .slice(0, 6)
        setCompanies(merged)
      })
      .catch(function () {
        if (cancelled) return
        setCompanies([])
      })
      .finally(function () {
        if (cancelled) return
        setLoading(false)
      })
    return function () { cancelled = true }
  }, [])

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Loading companies...</p>
      </section>
    )
  }

  if (companies.length === 0) {
    return null
  }

  return (
    <section id="companies" className="max-w-6xl mx-auto px-6 pb-16">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-[22px]">Featured companies</h2>
        <Link to="/companies" className="text-[13.5px] font-medium" style={{ color: 'var(--accent-purple)' }}>
          View all →
        </Link>
      </div>
      <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
        Actively hiring for data roles right now
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {companies.map(function (c) {
          return (
            <Link
              key={c.name}
              to={'/jobs?company=' + encodeURIComponent(c.name)}
              className="rounded-2xl p-5 text-center block hover:opacity-90 transition-opacity"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-3"
                style={{ background: c.grad }}
              >
                {c.initial}
              </div>
              <div className="font-semibold text-[14.5px] mb-1">{c.name}</div>
              <div className="text-[12.5px]" style={{ color: 'var(--text-secondary)' }}>{c.roles} open roles</div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}