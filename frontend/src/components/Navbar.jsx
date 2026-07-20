import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { pathname } = useLocation()
  const { dark, setDark } = useTheme()
  const auth = useAuth()
  const navigate = useNavigate()

  const linkStyle = (path) => ({
    color: pathname === path ? 'var(--text-primary)' : 'var(--nav-link)',
    fontWeight: pathname === path ? 600 : 400,
  })

  function handleLogout() {
    auth.logout()
    navigate('/')
  }

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center font-extrabold text-lg bg-gradient">
            D
          </div>
          <div>
            <div className="font-extrabold text-lg leading-tight">DataHive</div>
            <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>AI Career Platform</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-[14.5px]">
          <Link to="/" style={linkStyle('/')} className="hover:opacity-80 transition-opacity">Home</Link>
          <Link to="/jobs" style={linkStyle('/jobs')} className="hover:opacity-80 transition-opacity">Jobs</Link>
          <Link to="/companies" style={linkStyle('/companies')} className="hover:opacity-80 transition-opacity">Companies</Link>
          <Link to="/insights" style={linkStyle('/insights')} className="hover:opacity-80 transition-opacity">Insights</Link>
          {auth.isLoggedIn && (
            <Link to="/saved" style={linkStyle('/saved')} className="hover:opacity-80 transition-opacity">Saved</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[14px] transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            {dark ? '☾' : '☀'}
          </button>

          {auth.isLoggedIn ? (
            <>
              <span className="hidden sm:inline text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                Hi, {auth.user?.name?.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="px-4.5 py-2 rounded-lg font-semibold text-[14px] hover:opacity-80 transition-opacity"
                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline text-[14px] hover:opacity-80 transition-opacity" style={{ color: 'var(--nav-link)' }}>
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4.5 py-2 rounded-lg font-semibold text-[14px] bg-gradient hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}