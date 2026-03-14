import { useState } from 'react'
import styles from './LoginPage.module.css'

const USERS = { admin: 'password123', employee: 'emp123' }

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (USERS[username] && USERS[username] === password) {
      onLogin(username)
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className={styles.bg}>
      <div className={styles.glow1} />
      <div className={styles.glow2} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⏱</div>
          <span className={styles.logoText}>Work<span className={styles.green}>Track</span></span>
        </div>
        <h2 className={styles.heading}>Welcome back</h2>
        <p className={styles.subtitle}>Sign in to track your work hours</p>

        {error && <div className={styles.error}>⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Username</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={e => { setUsername(e.target.value); setError('') }}
            required
          />
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            required
          />
          <button className={styles.btn} type="submit">Sign In →</button>
        </form>

        <div className={styles.hint}>
          <strong>Demo:</strong> admin / password123 &nbsp;|&nbsp; employee / emp123
        </div>
      </div>
    </div>
  )
}
