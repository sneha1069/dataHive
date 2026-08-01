import { ROLES, LOCATIONS, MODES, SOURCES } from '../data/jobs'

const selectStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
}

function Dropdown({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[150px] flex-1">
      <label className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg px-3 py-2.5 text-[13.5px] outline-none cursor-pointer"
        style={selectStyle}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

const SALARY_OPTIONS = [0, 2, 4, 6, 8, 10, 15, 20, 25, 30]

const DATE_POSTED_OPTIONS = [
  { label: 'Any Time', value: 'any' },
  { label: 'Last 24 Hours', value: '1' },
  { label: 'Last 3 Days', value: '3' },
  { label: 'Last Week', value: '7' },
  { label: 'Last Month', value: '30' },
]

export default function FiltersBar({ filters, setFilters }) {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }))

  const reset = () =>
    setFilters({
      role: 'All Roles',
      location: 'All Locations',
      mode: 'All Modes',
      source: 'All Sources',
      minSalary: 0,
      datePosted: 'any',
    })

  return (
    <div
      className="rounded-2xl p-4 mb-7 flex flex-wrap items-end gap-3.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <Dropdown label="Role" options={ROLES} value={filters.role} onChange={(v) => update('role', v)} />
      <Dropdown label="Location" options={LOCATIONS} value={filters.location} onChange={(v) => update('location', v)} />
      <Dropdown label="Work Mode" options={MODES} value={filters.mode} onChange={(v) => update('mode', v)} />
      <Dropdown label="Source" options={SOURCES} value={filters.source} onChange={(v) => update('source', v)} />

      <div className="flex flex-col gap-1.5 min-w-[150px] flex-1">
        <label className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Date Posted
        </label>
        <select
          value={filters.datePosted}
          onChange={(e) => update('datePosted', e.target.value)}
          className="rounded-lg px-3 py-2.5 text-[13.5px] outline-none cursor-pointer"
          style={selectStyle}
        >
          {DATE_POSTED_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[150px] flex-1">
        <label className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Min. Salary (LPA)
        </label>
        <select
          value={filters.minSalary}
          onChange={(e) => update('minSalary', Number(e.target.value))}
          className="rounded-lg px-3 py-2.5 text-[13.5px] outline-none cursor-pointer"
          style={selectStyle}
        >
          {SALARY_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n === 0 ? 'Any' : `₹${n} LPA+`}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={reset}
        className="px-4 py-2.5 rounded-lg text-[13px] font-medium h-[42px]"
        style={{ background: 'var(--tag-bg)', color: 'var(--accent-purple)' }}
      >
        Reset
      </button>
    </div>
  )
}