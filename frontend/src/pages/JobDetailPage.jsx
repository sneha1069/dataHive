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
              rel="noreferrer"
              className="rounded-full px-5 py-3 text-[15px] font-semibold"
              style={{ background: job.topbar, color: '#fff' }}
            >
              Apply
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl p-6 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)]">
              <p className="text-[13px] uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-secondary)' }}>Job details</p>
              <p className="text-[15px] mb-3"><strong>Location:</strong> {locationLabel}</p>
              <p className="text-[15px] mb-3"><strong>Salary:</strong> {salaryLabel}</p>
              <p className="text-[15px]"><strong>Experience:</strong> {job.experience}</p>
            </div>
            <div className="rounded-2xl p-6 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)]">
              <p className="text-[13px] uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--text-secondary)' }}>About the role</p>
              <p className="text-[15px]">{aboutText}</p>
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="p-7">
            <h2 className="font-extrabold text-[20px] mb-5">Similar jobs</h2>
            <div className="grid gap-4">
              {similar.map(function (jobItem) {
                return (
                  <Link
                    key={jobItem.id}
                    to={`/jobs/${jobItem.id}`}
                    className="rounded-2xl p-5 border border-[rgba(255,255,255,0.08)] hover:border-[var(--accent-purple)] transition"
                    style={{ background: 'var(--surface)' }}
                  >
                    <p className="font-semibold">{jobItem.title}</p>
                    <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>{jobItem.company}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
