import { useState } from 'react'
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'

export default function App() {
  const [user, setUser] = useState(() => sessionStorage.getItem('wt_user') || null)

  function handleLogin(username) {
    sessionStorage.setItem('wt_user', username)
    setUser(username)
  }

  function handleLogout() {
    sessionStorage.removeItem('wt_user')
    setUser(null)
  }

  if (!user) return <LoginPage onLogin={handleLogin} />
  return <Dashboard user={user} onLogout={handleLogout} />
}
