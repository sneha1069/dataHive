import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchJobs } from '../services/api'

const ROLE_TAGS = ['Data Analyst', 'Data Engineer', 'BI Developer', 'Data Scientist', 'SQL Developer']

export default function Hero() {
  const [query, setQuery] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [liveJobs, setLiveJobs] = useState([])
  const navigate = useNavigate()

  useEffect(function () {
    const id = setInterval(function () {
      setPlaceholderIdx(function (i) { return (i + 1) % ROLE_TAGS.length })
    }, 2000)
    return function () { clearInterval(id) }
  }, [])

  useEffect(function () {
    let cancelled = false
    fetchJobs({ perPage: 3 })
      .then(function (data) {
        if (cancelled) return
        setLiveJobs(data.jobs)
      })
      .catch(function () {
        if (cancelled) return
        setLiveJobs([])
      })
    return function () { cancelled = true }
  }, [])

  function handleSearch() {
    if (query.trim()) {
      navigate('/jobs?search=' + encodeURIComponent(query.trim()))
    } else {
      navigate('/jobs')
    }
  }

  return (
    <section id="home" className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10">
      <div>
        <h1 className="font-extrabold text-[44px] md:text-[52px] leading-[1.08] mb-5">
          Find Your
          <br />
          <span className="text-gradient">Dream Data Career</span>
        </h1>
        <p className="text-[16.5px] max-w-[480px] mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Discover verified Data Analyst, Data Scientist, Data Engineer and BI jobs
          aggregated from multiple trusted job platforms.
        </p>

        <div className="flex rounded-[10px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <input
            value={query}
            onChange={function (e) { setQuery(e.target.value) }}
            onKeyDown={function (e) { if (e.key === 'Enter') handleSearch() }}
            placeholder={'Search ' + ROLE_TAGS[placeholderIdx] + '...'}
            className="flex-1 outline-none px-4.5 py-3.5 text-[14.5px]"
            style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}
          />
          <button onClick={handleSearch} className="px-7 font-semibold text-[14.5px] bg-gradient">
            Search
          </button>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center mb-1">
          <div className="font-bold text-[17px]">Live Hiring</div>
          <span
            className="flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-green)' }} />
            Live
          </span>
        </div>
        <div className="text-[12.5px] mb-4" style={{ color: 'var(--text-secondary)' }}>
          Updated daily from Naukri and Indeed
        </div>
        {liveJobs.length === 0 ? (
          <div className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Loading live jobs...</div>
        ) : (
          liveJobs.map(function (j) {
            return (
              <div key={j.id} className="rounded-xl p-3.5 mb-2.5" style={{ background: 'var(--surface-2)' }}>
                <div className="font-semibold text-[14.5px]">{j.title}</div>
                <div className="text-[13px] mb-1.5" style={{ color: 'var(--text-secondary)' }}>{j.company}</div>
                {j.salary !== 'Not disclosed' && (
                  <div className="text-[13.5px] font-semibold" style={{ color: 'var(--accent-cyan)' }}>{'Rs ' + j.salary}</div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}