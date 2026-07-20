import { Link } from 'react-router-dom'
import { useSavedJobs } from '../context/SavedJobsContext'

export default function JobCard({ job }) {
  const { isSaved, toggleSave } = useSavedJobs()
  const saved = isSaved(job.id)

  return (
    <div className="rounded-xl overflow-hidden relative" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="h-1" style={{ background: job.topbar }} />

      <button
        onClick={(e) => { e.preventDefault(); toggleSave(job.id) }}
        aria-label={saved ? 'Remove from saved' : 'Save job'}
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md flex items-center justify-center text-[12px] z-10"
        style={{ background: 'var(--surface-2)', color: saved ? 'var(--accent-purple)' : 'var(--text-secondary)' }}
      >
        {saved ? '★' : '☆'}
      </button>

      <Link to={`/jobs/${job.id}`} className="block hover:opacity-95 transition-opacity">
        <div className="p-3.5">
          <div className="flex items-center gap-2 mb-2 pr-7">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] shrink-0"
              style={{ background: job.grad }}
            >
              {job.initial}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[13px] truncate">{job.company}</div>
              <div className="text-[10.5px]" style={{ color: 'var(--text-secondary)' }}>Hiring Now</div>
            </div>
          </div>

          <div className="font-bold text-[14.5px] mb-1.5 leading-snug">{job.title}</div>

          <div className="text-[11.5px] mb-3" style={{ color: 'var(--text-secondary)' }}>📍 {job.location}</div>

          {job.salary !== 'Not disclosed' && (
            <div className="text-[11.5px] font-semibold mb-1" style={{ color: 'var(--accent-green)' }}>₹ {job.salary}</div>
          )}

          {job.experience !== 'Not specified' && (
            <div className="text-[11.5px] mb-2" style={{ color: 'var(--text-secondary)' }}>🕐 {job.experience}</div>
          )}

          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {job.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="px-2 py-1 rounded-full text-[10.5px] font-medium"
                  style={{ background: 'var(--tag-bg)', color: 'var(--text-primary)' }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <span className="w-full block text-center py-1.5 rounded-md font-semibold text-[12px] bg-gradient hover:opacity-90 transition-opacity">
            View Details
          </span>
        </div>
      </Link>
    </div>
  )
}