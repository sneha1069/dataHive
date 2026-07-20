import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { fetchJobs } from '../services/api'

const PIE_COLORS = ['#A855F7', '#06B6D4', '#EC4899', '#34D399', '#F59E0B', '#3B82F6']

function computeSalaryByRole(jobs) {
  const roles = {}
  jobs.forEach(function (j) {
    if (j.salaryMin == null) return
    if (!roles[j.role]) roles[j.role] = []
    roles[j.role].push(j.salaryMin)
  })
  return Object.entries(roles).map(function (entry) {
    const role = entry[0]
    const arr = entry[1]
    const sum = arr.reduce(function (a, b) { return a + b }, 0)
    return { role: role, avgSalary: Math.round(sum / arr.length) }
  })
}

function computeModeDistribution(jobs) {
  const counts = {}
  jobs.forEach(function (j) {
    counts[j.mode] = (counts[j.mode] || 0) + 1
  })
  return Object.entries(counts).map(function (entry) {
    return { name: entry[0], value: entry[1] }
  })
}

function computeTopCompanies(jobs) {
  const counts = {}
  jobs.forEach(function (j) {
    counts[j.company] = (counts[j.company] || 0) + 1
  })
  return Object.entries(counts)
    .map(function (entry) { return { company: entry[0], roles: entry[1] } })
    .sort(function (a, b) { return b.roles - a.roles })
    .slice(0, 6)
}

function ChartCard(props) {
  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="font-bold text-[16px] mb-1">{props.title}</div>
      <div className="text-[12.5px] mb-5" style={{ color: 'var(--text-secondary)' }}>{props.subtitle}</div>
      {props.children}
    </div>
  )
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function () {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchJobs({ perPage: 1000 })
      .then(function (data) {
        if (cancelled) return
        setJobs(data.jobs)
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
  }, [])

  const tickColor = 'var(--text-secondary)'
  const tooltipBg = 'var(--surface-2)'
  const tooltipBorder = '1px solid var(--border)'

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Loading insights...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Could not load insights. Is the backend running?</p>
      </div>
    )
  }

  const salaryData = computeSalaryByRole(jobs)
  const modeData = computeModeDistribution(jobs)
  const companyData = computeTopCompanies(jobs)

  const salariesWithValue = jobs.filter(function (j) { return j.salaryMin != null })
  const totalSalary = salariesWithValue.reduce(function (a, j) { return a + j.salaryMin }, 0)
  const avgMinSalary = salariesWithValue.length ? Math.round(totalSalary / salariesWithValue.length) : 0
  const remoteCount = jobs.filter(function (j) { return j.mode === 'Remote' }).length
  const companiesCount = new Set(jobs.map(function (j) { return j.company })).size

  const tooltipStyleObj = { background: tooltipBg, border: tooltipBorder, borderRadius: 8, fontSize: 12.5 }
  const cursorStyleObj = { fill: tooltipBg }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-extrabold text-[30px] mb-2">Market Insights</h1>
        <p className="text-[14.5px]" style={{ color: 'var(--text-secondary)' }}>
          Based on {jobs.length} tracked listings
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-[18px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="font-extrabold text-[22px] mb-1">{jobs.length}</div>
          <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Total roles</div>
        </div>
        <div className="rounded-2xl p-[18px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="font-extrabold text-[22px] mb-1">{companiesCount}</div>
          <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Companies hiring</div>
        </div>
        <div className="rounded-2xl p-[18px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="font-extrabold text-[22px] mb-1">Rs {avgMinSalary} LPA</div>
          <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Avg. min salary</div>
        </div>
        <div className="rounded-2xl p-[18px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="font-extrabold text-[22px] mb-1">{remoteCount}</div>
          <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Remote roles</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Avg. starting salary by role" subtitle="Minimum LPA, per role category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={salaryData} margin={{ top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="role" tick={{ fill: tickColor, fontSize: 10.5 }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: tickColor, fontSize: 11.5 }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyleObj} cursor={cursorStyleObj} />
              <Bar dataKey="avgSalary" fill="#06B6D4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Work mode split" subtitle="Onsite vs Hybrid vs Remote">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={modeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {modeData.map(function (entry, i) {
                  return <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                })}
              </Pie>
              <Tooltip contentStyle={tooltipStyleObj} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {modeData.map(function (m, i) {
              return (
                <div key={m.name} className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {m.name}
                </div>
              )
            })}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Top hiring companies" subtitle="By number of open roles tracked">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={companyData} margin={{ top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="company" tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: tickColor, fontSize: 11.5 }} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyleObj} cursor={cursorStyleObj} />
            <Bar dataKey="roles" fill="#EC4899" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}