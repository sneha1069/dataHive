import { Link } from 'react-router-dom'

const ROLE_TAGS = ['Data Analyst', 'Data Engineer', 'BI Developer', 'Data Scientist']

const WORKING_LINKS = {
  Product: [
    { label: 'Browse jobs', to: '/jobs' },
    { label: 'Companies', to: '/companies' },
    { label: 'Insights', to: '/insights' },
  ],
  Company: [
    { label: 'About', to: null },
    { label: 'Contact', to: null },
    { label: 'Privacy policy', to: null },
    { label: 'Terms', to: null },
  ],
}

export default function Footer() {
  return (
    <footer className="pt-12 pb-7 px-6" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-9">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm bg-gradient">D</div>
            <span className="font-bold text-[16px]">DataHive</span>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Every data job, aggregated in one place.
          </p>
        </div>

        {Object.entries(WORKING_LINKS).map(function (entry) {
          const heading = entry[0]
          const items = entry[1]
          return (
            <div key={heading}>
              <div className="font-semibold text-[13.5px] mb-3">{heading}</div>
              {items.map(function (item) {
                if (item.to) {
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="block text-[13px] mb-2 hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item.label}
                    </Link>
                  )
                }
                return (
                  <div key={item.label} className="text-[13px] mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                    {item.label}
                  </div>
                )
              })}
            </div>
          )
        })}

        <div>
          <div className="font-semibold text-[13.5px] mb-3">Roles</div>
          {ROLE_TAGS.map(function (role) {
            return (
              <Link
                key={role}
                to={'/jobs?role=' + encodeURIComponent(role)}
                className="block text-[13px] mb-2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                {role}
              </Link>
            )
          })}
        </div>
      </div>

      <div
        className="max-w-6xl mx-auto pt-5 text-[12.5px] text-center"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        © 2026 DataHive. Job data sourced from Indeed and Naukri.
      </div>
    </footer>
  )
}