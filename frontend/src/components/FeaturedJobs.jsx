import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import JobCard from './JobCard'
import { fetchJobs } from '../services/api'

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    let cancelled = false
    fetchJobs({ perPage: 3 })
      .then(function (data) {
        if (cancelled) return
        setJobs(data.jobs)
      })
      .catch(function () {
        if (cancelled) return
        setJobs([])
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
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Loading trending roles...</p>
      </section>
    )
  }

  if (jobs.length === 0) {
    return null
  }

  return (
    <section id="jobs" className="max-w-6xl mx-auto px-6 pb-16">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-[22px]">Trending roles</h2>
        <Link to="/jobs" className="text-[13.5px] font-medium" style={{ color: 'var(--accent-purple)' }}>
          View all jobs →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map(function (job) {
          return <JobCard key={job.id} job={job} />
        })}
      </div>
    </section>
  )
}