import { useState, useEffect, useCallback } from 'react'
import { calculateTimes, liveWalk, fmtMins, fmt12 } from './utils'
import styles from './Dashboard.module.css'

export default function Dashboard({ user, onLogout }) {
  const [arrival, setArrival] = useState('')
  const [productive, setProductive] = useState('')
  const [result, setResult] = useState(null)
  const [now, setNow] = useState(new Date())
  const [liveWalkMins, setLiveWalkMins] = useState(null)

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Live walk countdown
  useEffect(() => {
    if (!result || result.alreadyPastHome) { setLiveWalkMins(null); return }
    const update = () => {
      const w = liveWalk(result.goHomeMins, result.productiveNeedMore)
      setLiveWalkMins(w)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [result])

  function handleCalculate(e) {
    e.preventDefault()
    if (!arrival) return
    const r = calculateTimes(arrival, productive || null)
    setResult(r)
  }

  function handleReset() {
    setArrival('')
    setProductive('')
    setResult(null)
    setLiveWalkMins(null)
  }

  function liveTime() {
    return fmt12(now.getHours(), now.getMinutes()) + ':' + String(now.getSeconds()).padStart(2, '0')
  }

  const walkDisplay = liveWalkMins !== null ? liveWalkMins : (result ? result.walkTotalMins : 0)

  return (
    <div className={styles.page}>
      {/* BG glow */}
      <div className={styles.bgGlow} />

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.navIcon}>⏱</div>
          Work<span className={styles.green}>Track</span>
        </div>
        <div className={styles.navRight}>
          <span className={styles.navTime}>{liveTime()}</span>
          <span className={styles.navUser}>👤 {user}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.heading}>Today's Work Hours</h1>
          <p className={styles.subheading}>Enter your arrival time to calculate go-home time & walk window</p>
        </div>

        {/* Input Card */}
        <div className={styles.inputCard}>
          <h3 className={styles.cardTitle}>🕐 Time Calculator</h3>
          <form onSubmit={handleCalculate}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Arrival Time *</label>
                <input
                  className={styles.timeInput}
                  type="time"
                  value={arrival}
                  onChange={e => setArrival(e.target.value)}
                  required
                />
                <div className={styles.fieldHint}>Required — calculates 8h 30m shift end</div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Productive Time (optional)</label>
                <input
                  className={styles.timeInput}
                  type="time"
                  value={productive}
                  onChange={e => setProductive(e.target.value)}
                />
                <div className={styles.fieldHint}>Track progress toward 7h goal</div>
              </div>
              <div className={styles.btnGroup}>
                <button className={styles.calcBtn} type="submit">Calculate →</button>
                {result && <button className={styles.resetBtn} type="button" onClick={handleReset}>Reset</button>}
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className={styles.results}>
            <div className={styles.resultsTitle}>📊 Your Results</div>

            {/* Arrival + Go Home */}
            <div className={styles.cardsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>🟢 Arrival Time</div>
                <div className={styles.statValue}>{result.arrival}</div>
                <div className={styles.statSub}>Shift start recorded</div>
              </div>
              <div className={`${styles.statCard} ${styles.highlight}`}>
                <div className={styles.statLabel}>🏠 Go Home Time</div>
                <div className={`${styles.statValue} ${styles.yellow}`}>{result.goHome}</div>
                <div className={styles.statSub}>Arrival + 8 hours 30 minutes</div>
              </div>
            </div>

            {/* Productive Progress */}
            {result.hasProductive && (
              <div className={styles.progressCard}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>⚡ Productive Time Goal (7 hours)</span>
                  <span className={`${styles.pct} ${result.productivePercent >= 80 ? '' : result.productivePercent >= 50 ? styles.warn : styles.low}`}>
                    {result.productivePercent}%
                  </span>
                </div>
                <div className={styles.progressBarBg}>
                  <div
                    className={`${styles.progressBarFill} ${result.productivePercent < 50 ? styles.fillLow : result.productivePercent < 80 ? styles.fillWarn : ''}`}
                    style={{ width: `${result.productivePercent}%` }}
                  />
                </div>
                <div className={styles.progressEdges}>
                  <span>0h</span>
                  <span>7h target</span>
                </div>

                {result.productiveDone ? (
                  <div className={styles.doneBadge}>✅ 7 Hour Goal Complete!</div>
                ) : (
                  <div className={styles.progressDetails}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Remaining</div>
                      <div className={`${styles.detailValue} ${styles.yellow}`}>{result.productiveRemaining}</div>
                    </div>
                    {result.productiveComplete && (
                      <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Goal Completes ~</div>
                        <div className={`${styles.detailValue} ${styles.green}`}>{result.productiveComplete}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Walk Outside Card */}
            <WalkCard result={result} walkDisplay={walkDisplay} liveWalkMins={liveWalkMins} />
          </div>
        )}
      </main>
    </div>
  )
}

function WalkCard({ result, walkDisplay, liveWalkMins }) {
  const noProductive = !result.hasProductive
  const notDoneNoWalk = result.hasProductive && !result.productiveDone && result.walkTotalMins === 0
  const canWalk = walkDisplay > 0

  let cardClass = styles.walkCard
  if (result.alreadyPastHome || notDoneNoWalk) cardClass += ' ' + styles.walkCardRed
  else if (noProductive) cardClass += ' ' + styles.walkCardLocked

  return (
    <div className={cardClass}>
      <div className={styles.walkHeader}>
        <div>
          <div className={styles.walkTitle}>🚶 Walk Outside Time</div>
          <div className={styles.walkSubtitle}>{result.walkReason}</div>
        </div>
        {canWalk && !result.alreadyPastHome && (
          <div className={styles.liveCountdown}>
            🚶 {fmtMins(walkDisplay)} to walk
          </div>
        )}
      </div>

      {result.alreadyPastHome ? (
        <div className={`${styles.walkBig} ${styles.walkBigRed}`}>Shift Over!</div>

      ) : noProductive ? (
        <>
          <div className={`${styles.walkBig} ${styles.walkBigRed}`} style={{ fontSize: 20, letterSpacing: 0 }}>—</div>
          <div className={styles.walkNote}>Add productive time above to unlock walk calculation.</div>
        </>

      ) : result.productiveDone ? (
        // 7h done — all remaining time is free
        <>
          <div className={styles.walkBig} style={{ color: 'var(--blue)' }}>
            {fmtMins(walkDisplay)}
          </div>
          <div className={styles.walkNote}>
            free time to walk — must be back by <strong style={{ color: 'var(--accent)' }}>{result.goHome}</strong>
          </div>
          <div className={styles.walkMeta}>
            <MetaItem label="🏠 Return By" value={result.goHome} />
            <MetaItem label="✅ Productive Goal" value="Done!" valueColor="var(--accent)" />
          </div>
          <div className={styles.walkTip}>
            💡 Walk time counts down live — every minute you wait is a minute less to walk!
          </div>
        </>

      ) : canWalk ? (
        // Can walk — productive not done but gap exists
        <>
          <div className={styles.walkBig} style={{ color: 'var(--blue)' }}>
            {fmtMins(walkDisplay)}
          </div>
          <div className={styles.walkNote}>
            walk now → come back → finish{' '}
            <strong style={{ color: 'var(--yellow)' }}>{result.productiveRemaining}</strong>
            {' '}→ hit 7h by <strong style={{ color: 'var(--accent)' }}>{result.goHome}</strong>
          </div>
          <div className={styles.walkMeta}>
            <MetaItem label="🏠 Return By" value={result.goHome} />
            <MetaItem label="⚡ Productive Left" value={result.productiveRemaining} valueColor="var(--yellow)" />
            <MetaItem label="📋 7h Completes ~" value={result.productiveComplete} />
          </div>
          <div className={styles.walkTip}>
            💡 Walk now for exactly this long — come back and finish work — 7h done by go-home!
          </div>
        </>

      ) : (
        // No walk time at all
        <>
          <div className={`${styles.walkBig} ${styles.walkBigRed}`}>0m</div>
          <div className={styles.walkNote}>
            Not enough time — still need{' '}
            <strong style={{ color: 'var(--red)' }}>{result.productiveRemaining}</strong> of productive work.
          </div>
          <div className={styles.walkMeta}>
            <MetaItem label="🏠 Go Home At" value={result.goHome} />
            <MetaItem label="⚡ Productive Left" value={result.productiveRemaining} valueColor="var(--red)" />
            <MetaItem label="📋 Goal Completes ~" value={result.productiveComplete} />
          </div>
        </>
      )}
    </div>
  )
}

function MetaItem({ label, value, valueColor }) {
  return (
    <div className={styles.metaItem}>
      <div className={styles.metaLabel}>{label}</div>
      <div className={styles.metaValue} style={valueColor ? { color: valueColor } : {}}>{value}</div>
    </div>
  )
}
