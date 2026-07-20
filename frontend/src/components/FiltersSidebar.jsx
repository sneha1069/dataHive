import { ROLES, LOCATIONS, MODES } from '../data/jobs'

export default function FiltersSidebar({ filters, setFilters }) {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }))

  const Section = ({ label, options, filterKey }) => (
    <div className="mb-6">
      <div className="font-semibold text-[13.5px] mb-3">{label}</div>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer text-[13.5px]" style={{ color: 'var(--text-secondary)' }}>
            <input
              type="radio"
              name={filterKey}
              checked={filters[filterKey] === opt}
              onChange={() => update(filterKey, opt)}
              className="accent-purple-500"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <aside
      className="w-full lg:w-64 shrink-0 rounded-2xl p-5 h-fit"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="font-bold text-[15px]">Filters</div>
        <button
          onClick={() => setFilters({ role: 'All Roles', location: 'All Locations', mode: 'All Modes', minSalary: 0 })}
          className="text-[12.5px]"
          style={{ color: 'var(--accent-purple)' }}
        >
          Reset
        </button>
      </div>

      <Section label="Role" options={ROLES} filterKey="role" />
      <Section label="Location" options={LOCATIONS} filterKey="location" />
      <Section label="Work Mode" options={MODES} filterKey="mode" />

      <div>
        <div className="font-semibold text-[13.5px] mb-3">Min. Salary (LPA)</div>
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={filters.minSalary}
          onChange={(e) => update('minSalary', Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <div className="text-[12.5px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          ₹{filters.minSalary} LPA and above
        </div>
      </div>
    </aside>
  )
}