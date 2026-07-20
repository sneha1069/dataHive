import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { COMPANIES_LIST, ALL_JOBS } from '../data/jobs'

export default function CompaniesPage() {
  const [search, setSearch] = useState('')

  const companies = useMemo(() => {
    return COMPANIES_LIST
      .map((c) => ({ ...c, roles: ALL_JOBS.filter((j) => j.company === c.name).length }))
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-7">
        <h1 className="font-extrabold text-[30px] mb-2">Companies hiring for data roles</h1>
        <p className="text-[14.5px]" style={{ color: 'var(--text-secondary)' }}>
          {companies.length} companies · browse by industry or search by name
        </p>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search companies..."
        className="w-full max-w-md mb-8 rounded-[10px] px-4.5 py-3.5 text-[14.5px] outline-none"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((c) => (
          <Link
            key={c.name}
            to={`/jobs?company=${encodeURIComponent(c.name)}`}
            className="rounded-2xl p-6 block hover:opacity-90 transition-opacity"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl"
                style={{ background: c.grad }}
              >
                {c.initial}
              </div>
              <div>
                <div className="font-bold text-[17px]">{c.name}</div>
                <div className="text-[12.5px]" style={{ color: 'var(--text-secondary)' }}>{c.industry}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              <span>📍 {c.hq}</span>
              <span
                className="px-2.5 py-1 rounded-full font-semibold"
                style={{ background: 'var(--tag-bg)', color: 'var(--accent-green)' }}
              >
                {c.roles} open roles
              </span>
            </div>
          </Link>
        ))}
      </div>

      {companies.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center mt-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          No companies match "{search}".
        </div>
      )}
    </div>
  )
}