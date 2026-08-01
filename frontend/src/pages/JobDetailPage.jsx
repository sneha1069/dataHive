import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchJobById, fetchJobs } from '../services/api'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(function () {
    let cancelled = false
    setLoading(true)
    setNotFound(false)

    fetchJobById(id)
      .then(function (data) {
        if (cancelled) return
        setJob(data)
        return fetchJobs({ role: data.role, perPage: 4 })
      })
      .then(function (similarData) {
        if (cancelled || !similarData) return
        var filtered = similarData.jobs.filter(function (j) {
          return String(j.id) !== id
        })
        setSimilar(filtered.slice(0, 3))
      })
      .catch(function () {
        if (cancelled) return
        setNotFound(true)
      })
      .finally(function () {
        if (cancelled) return
        setLoading(false)
      })

    return function () {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Loading job...</p>
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Job not found.</p>
        <Link to="/jobs" className="text-[14px] font-medium mt-3 inline-block" style={{ color: 'var(--accent-purple)' }}>
          Back to jobs
        </Link>
      </div>
    )
  }

  var locationLabel = job.location + ' - ' + job.mode
  var salaryLabel = 'Rs ' + job.salary
  var skillsText = job.skills.length > 0 ? ' with strong skills in ' + job.skills.join(', ') : ''
  var aboutText = job.company + ' is hiring a ' + job.title + ' to join their ' + job.mode.toLowerCase() + ' team in ' + job.location + '. This role requires ' + job.experience.toLowerCase() + ' of relevant experience' + skillsText + '. Posted ' + job.posted + ' via ' + job.source + '.'

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button
        onClick={function () { navigate(-1) }}
        className="text-[13.5px] mb-6 inline-flex items-center gap-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        Back
      </button>

      <div className="rounded-2xl overflow-hidden mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="h-1.5" style={{ background: job.topbar }} />
        <div className="p-7">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl" style={{ background: job.grad }}>
                {job.initial}
              </div>
              <div>
                <h1 className="font-extrabold text-[26px] mb-1">{job.title}</h1>
                <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>{job.company}</p>
              </div>
            </div>
            <a
              href={job.applyLink ? job.applyLink : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl font-semibold text-[14.5px] bg-gradient hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Apply Now
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
            <div className="rounded-xl p-3.5" style={{ background: 'var(--surface-2)' }}>
              <div className="text-[11.5px] mb-1" style={{ color: 'var(--text-muted)' }}>Location</div>
              <div className="text-[13.5px] font-semibold">{locationLabel}</div>
            </div>
            <div className="rounded-xl p-3.5" style={{ background: 'var(--surface-2)' }}>
              <div className="text-[11.5px] mb-1" style={{ color: 'var(--text-muted)' }}>Salary</div>
              <div className="text-[13.5px] font-semibold">{salaryLabel}</div>
            </div>
            <div className="rounded-xl p-3.5" style={{ background: 'var(--surface-2)' }}>
              <div className="text-[11.5px] mb-1" style={{ color: 'var(--text-muted)' }}>Experience</div>
              <div className="text-[13.5px] font-semibold">{job.experience}</div>
            </div>
            <div className="rounded-xl p-3.5" style={{ background: 'var(--surface-2)' }}>
              <div className="text-[11.5px] mb-1" style={{ color: 'var(--text-muted)' }}>Source</div>
              <div className="text-[13.5px] font-semibold">{job.source}</div>
            </div>
          </div>

          {job.skills.length > 0 && (
            <div className="mb-7">
              <div className="font-semibold text-[15px] mb-3">Skills required</div>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(function (s) {
                  return (
                    <span key={s} className="px-3.5 py-2 rounded-full text-[13px]" style={{ background: 'var(--tag-bg)', color: 'var(--nav-link)' }}>
                      {s}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <div className="font-semibold text-[15px] mb-3">About this role</div>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {aboutText}
            </p>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div>
          <div className="font-bold text-[19px] mb-4">Similar roles</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similar.map(function (j) {
              return (
                <Link
                  key={j.id}
                  to={'/jobs/' + j.id}
                  className="rounded-xl p-4 block hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="font-semibold text-[14px] mb-1">{j.title}</div>
                  <div className="text-[12.5px] mb-2" style={{ color: 'var(--text-secondary)' }}>{j.company}</div>
                  <div className="text-[13px] font-semibold" style={{ color: 'var(--accent-green)' }}>Rs {j.salary}</div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}