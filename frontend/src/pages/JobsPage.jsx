import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import JobCard from '../components/JobCard'
import FiltersSidebar from '../components/FiltersSidebar'
import { fetchJobs } from '../services/api'

const PAGE_SIZE = 6

export default function JobsPage() {
  const [searchParams] = useSearchParams()
  const companyParam = searchParams.get('company')
  const roleParam = searchParams.get('role')
  const searchParam = searchParams.get('search')

  const [filters, setFilters] = useState({
    role: roleParam || 'All Roles',
    location: 'All Locations',
    mode: 'All Modes',
    minSalary: 0,
  })
  const [search, setSearch] = useState(searchParam || '')
  const [page, setPage] = useState(1)

  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function () {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchJobs({
      role: filters.role,
      location: filters.location,
      mode: filters.mode,
      minSalary: filters.minSalary,
      search: search,
      company: companyParam,
      page: page,
      perPage: PAGE_SIZE,
    })
      .then(function (data) {
        if (cancelled) return
        setJobs(data.jobs)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      })
      .catch(function (err) {
        if (cancelled) return
        setError(err.message)
      })
      .finally(function () {
        if (cancelled) return
        setLoading(false)
      })

    return function () { cancelled = true }
  }, [filters, search, companyParam, page])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-7">
        <h1 className="font-extrabold text-[30px] mb-2">Browse Data Jobs</h1>
        <p className="text-[14.5px]" style={{ color: 'var(--text-secondary)' }}>
          {total} roles found - sourced from Naukri and Indeed
        </p>
        {companyParam && (
          <div
            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-[13px]"
            style={{ background: 'var(--tag-bg)', color: 'var(--text-primary)' }}
          >
            Filtering by <strong>{companyParam}</strong>
            <a href="/jobs" style={{ color: 'var(--accent-purple)' }}>✕</a>
          </div>
        )}
      </div>

      <input
        value={search}
        onChange={function (e) { setSearch(e.target.value); setPage(1) }}
        placeholder="Search by title or company..."
        className="w-full mb-7 rounded-[10px] px-4.5 py-3.5 text-[14.5px] outline-none"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <FiltersSidebar filters={filters} setFilters={function (f) { setFilters(f); setPage(1) }} />

        <div className="flex-1">
          {loading ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              Loading jobs...
            </div>
          ) : error ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              Couldn't load jobs. Is the backend running?
            </div>
          ) : jobs.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              No jobs match these filters. Try widening your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {jobs.map(function (job) {
                return <JobCard key={job.id} job={job} />
              })}
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={function () { setPage(function (p) { return p - 1 }) }}
                className="px-3.5 py-2 rounded-lg text-[13px] disabled:opacity-40"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, function (_, i) { return i + 1 })
                .filter(function (n) { return n === 1 || n === page || n === page + 1 || n === page + 2 })
                .filter(function (n) { return n <= totalPages })
                .slice(0, 3)
                .map(function (n) {
                  return (
                    <button
                      key={n}
                      onClick={function () { setPage(n) }}
                      className="w-9 h-9 rounded-lg text-[13px] font-medium"
                      style={
                        n === page
                          ? { background: 'var(--gradient)', color: '#fff' }
                          : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }
                      }
                    >
                      {n}
                    </button>
                  )
                })}

              <button
                disabled={page === totalPages}
                onClick={function () { setPage(function (p) { return p + 1 }) }}
                className="px-3.5 py-2 rounded-lg text-[13px] disabled:opacity-40"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}