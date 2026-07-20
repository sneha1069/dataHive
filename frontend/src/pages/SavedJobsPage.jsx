import { Link } from 'react-router-dom'
import JobCard from '../components/JobCard'
import { useSavedJobs } from '../context/SavedJobsContext'
import { ALL_JOBS } from '../data/jobs'

export default function SavedJobsPage() {
  const { savedIds } = useSavedJobs()
  const savedJobs = ALL_JOBS.filter((j) => savedIds.includes(j.id))

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-7">
        <h1 className="font-extrabold text-[30px] mb-2">Saved Jobs</h1>
        <p className="text-[14.5px]" style={{ color: 'var(--text-secondary)' }}>
          {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div
          className="rounded-2xl p-14 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-[32px] mb-3">☆</div>
          <div className="font-semibold text-[16px] mb-2">No saved jobs yet</div>
          <p className="text-[13.5px] mb-5" style={{ color: 'var(--text-secondary)' }}>
            Tap the star on any job card to save it here for later.
          </p>
          <Link
            to="/jobs"
            className="inline-block px-5 py-2.5 rounded-lg font-semibold text-[13.5px] bg-gradient"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}