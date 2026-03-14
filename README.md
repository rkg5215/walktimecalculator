# WorkTrack — React

Work hours tracker built with React + Vite. Calculates go-home time, productive goal progress, and walk-outside window.

## 🚀 Deploy to GitHub Pages (3 steps)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/worktime-react.git
git push -u origin main
```

### 2. Enable GitHub Pages
- Go to your repo → **Settings** → **Pages**
- Under **Source**, select **GitHub Actions**
- Save

### 3. Done!
GitHub Actions will auto-build and deploy. Your app will be live at:
`https://YOUR_USERNAME.github.io/worktime-react/`

Every push to `main` auto-deploys. ✅

---

## 💻 Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 🔑 Demo Login
| Username | Password |
|----------|----------|
| admin | password123 |
| employee | emp123 |

## ✨ Features
- 🔐 Login/logout (session-based, no backend needed)
- 🕐 Arrival time → **Go-home time** (arrival + 8h 30m)
- ⚡ Productive time → **7h goal tracker** with progress bar
- 🚶 **Walk outside calculator** — smart logic:
  - If 7h done → all remaining time is yours to walk
  - If 7h not done → walk = (time until go-home) − (productive still needed)
  - If no spare time → shows 0m
- ⏱ Live clock + walk countdown updates every second
- 📱 Fully responsive
