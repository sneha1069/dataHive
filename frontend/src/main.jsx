import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { SavedJobsProvider } from './context/SavedJobsContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SavedJobsProvider>
          <App />
        </SavedJobsProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)