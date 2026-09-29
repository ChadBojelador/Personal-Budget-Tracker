import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AuthGate from './AuthGate'
import './styles.css'

const savedTheme = localStorage.getItem('budget-tracker-theme')
if (savedTheme === 'light' || savedTheme === 'dark') {
  document.documentElement.dataset.theme = savedTheme
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate>
      {(account) => <App userId={account.id} userEmail={account.email} onSignOut={account.signOut} />}
    </AuthGate>
  </StrictMode>,
)
