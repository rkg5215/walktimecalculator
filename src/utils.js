// All time calculation logic — mirrors the Python Flask logic exactly

export function calculateTimes(arrivalStr, productiveStr = null) {
  try {
    const [arrH, arrM] = arrivalStr.split(':').map(Number)
    const arrivalMins = arrH * 60 + arrM
    const goHomeMins = arrivalMins + 8 * 60 + 30  // +8h30m

    const goHomeH = Math.floor(goHomeMins / 60) % 24
    const goHomeM = goHomeMins % 60

    const now = new Date()
    const nowMins = now.getHours() * 60 + now.getMinutes()
    const timeUntilHome = goHomeMins - nowMins
    const alreadyPast = timeUntilHome <= 0

    let productiveComplete = null
    let productiveRemaining = null
    let productivePercent = 0
    let productiveDone = false
    let productiveNeedMore = null
    let walkMinutes = 0
    let walkReason = 'Enter productive time to calculate walk time'

    if (productiveStr) {
      const [pH, pM] = productiveStr.split(':').map(Number)
      const productiveMins = pH * 60 + pM
      const targetMins = 7 * 60  // 420

      productivePercent = Math.min(100, Math.round((productiveMins / targetMins) * 1000) / 10)

      if (productiveMins >= targetMins) {
        productiveDone = true
        productiveRemaining = '0h 0m'
        productiveComplete = 'Already Done!'
        productiveNeedMore = 0
        walkMinutes = Math.max(0, timeUntilHome)
        walkReason = `7h done! All remaining time until ${fmt12(goHomeH, goHomeM)} is yours`
      } else {
        const needMore = targetMins - productiveMins
        productiveNeedMore = needMore
        productiveRemaining = `${Math.floor(needMore / 60)}h ${needMore % 60}m`

        // productive_complete = now + needMore minutes
        const completeTime = new Date(now.getTime() + needMore * 60000)
        productiveComplete = fmt12(completeTime.getHours(), completeTime.getMinutes())

        walkMinutes = Math.max(0, timeUntilHome - needMore)

        if (walkMinutes > 0) {
          walkReason = `Walk now, come back & finish ${productiveRemaining} — done by go-home!`
        } else {
          walkReason = `No walk time — need ${productiveRemaining} of productive time left`
        }
      }
    }

    const walkH = Math.floor(walkMinutes / 60)
    const walkM = walkMinutes % 60

    return {
      arrival: fmt12(arrH, arrM),
      goHome: fmt12(goHomeH, goHomeM),
      goHomeMins,
      productiveComplete,
      productiveRemaining,
      productivePercent,
      productiveDone,
      productiveNeedMore,
      walkHours: walkH,
      walkMins: walkM,
      walkTotalMins: walkMinutes,
      walkReason,
      alreadyPastHome: alreadyPast,
      timeUntilHome: Math.max(0, timeUntilHome),
      hasProductive: Boolean(productiveStr),
    }
  } catch (e) {
    return null
  }
}

export function fmt12(h, m) {
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 || 12
  return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

export function fmtMins(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

// Live recalculate walk from goHomeMins and productiveNeedMore
export function liveWalk(goHomeMins, productiveNeedMore) {
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const timeLeft = goHomeMins - nowMins
  if (productiveNeedMore === 0) return Math.max(0, timeLeft)
  return Math.max(0, timeLeft - (productiveNeedMore || 0))
}
