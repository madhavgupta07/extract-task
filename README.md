# Daily Reality Check 🎯

A minimalist 7-day habit tracking app that helps you build consistency through small daily actions.

> *"Consistency is harder than intensity."*

---

## 🌟 Philosophy

**The Problem**: Most people fail at building habits because they try to do too much. They set ambitious goals, burn out, and quit.

**The Solution**: This app forces you to commit to just **ONE tiny daily action** for **7 days**. No excuses. No complexity. Just brutal honesty about whether you did it or not.

---

## ✨ Features

### 🔐 Zero-Friction Authentication
- **No signup or login required**
- Device-based identity using browser localStorage
- Automatic user creation on first visit
- Persistent across browser sessions

### 🎯 Habit Selection
- **5 preset habits**: Sleep, Walk, Water, Read, Meditate
- **Custom habit option**: Create your own habit
- Each habit requires a "minimum version" (the smallest possible action)

### 📅 Daily Check-In System
- **Binary accountability**: Yes or No — did you do it?
- **Reflection prompt**: Explain what helped or what stopped you
- **One log per day**: Prevents gaming the system
- **Day counter**: Track which day you're on (1-7)

### 📊 Progress Tracking
- Real-time status updates (setup → active → completed)
- Visual feedback for completed daily logs
- "Done for today" confirmation screen

### 🧠 Smart Insights
After 7 days, get personalized feedback based on your performance:

| Completion Rate | Insight |
|-----------------|---------|
| **6-7 days** (86-100%) | "You proved consistency is possible with small steps." |
| **4-5 days** (57-71%) | "You're building momentum, but watch out for weekend slip-ups." |
| **0-3 days** (0-43%) | "Your environment seems to be the biggest blocker. Try an even smaller habit." |

### 📜 History Log
- Complete record of all daily check-ins
- Date, completion status, and reason for each day
- Review your patterns and blockers

### 🔄 Restart Capability
- Start fresh with a new 7-day block anytime
- Previous logs are cleared for a clean slate
- Choose the same or a different habit

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 | UI components and state management |
| **Build Tool** | Vite | Fast development server and HMR |
| **Backend** | Node.js + Express | REST API server |
| **Storage** | JSON file | Simple file-based persistence (no DB needed) |
| **Styling** | Vanilla CSS | Custom animations and responsive design |

---

## 📁 Project Structure

```
daily-reality-check-mern/
│
├── client/                        # 🖥️ React Frontend
│   ├── src/
│   │   ├── App.jsx               # Main app with state-based routing
│   │   ├── main.jsx              # React entry point
│   │   ├── index.css             # Global styles and animations
│   │   └── components/
│   │       ├── SetupView.jsx     # Step 1: Habit selection & setup
│   │       ├── DailyView.jsx     # Step 2: Daily yes/no check-in
│   │       └── ResultView.jsx    # Step 3: 7-day summary & insights
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # ⚙️ Express Backend
│   ├── index.js                  # Server entry point (port 5000)
│   ├── routes/
│   │   └── api.js                # All API endpoints
│   ├── models/
│   │   └── UserLocal.js          # JSON-based data model (MongoDB-like API)
│   ├── data/
│   │   └── users.json            # Data storage (auto-created)
│   ├── .gitignore
│   └── package.json
│
└── README.md                      # You are here!
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd daily-reality-check-mern

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running the App

**Terminal 1 — Backend:**
```bash
cd server
npm run start
# ✅ Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# ✅ App running on http://localhost:5173
```

Open your browser and navigate to `http://localhost:5173`

---

## 🌐 Deploying to Vercel

This app is configured for one-click deployment to Vercel with serverless API functions.

### Prerequisites

1. **MongoDB Atlas Account** (free tier works)
   - Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Get your connection string

2. **Vercel Account** (free tier works)
   - Sign up at [vercel.com](https://vercel.com)

### Deployment Steps

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project root
cd daily-reality-check-mern
vercel
```

### Environment Variables

After deployment, set these in the **Vercel Dashboard** → Project Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |

### Project Structure for Vercel

```
daily-reality-check-mern/
├── api/
│   └── index.js          # Serverless API (auto-detected by Vercel)
├── client/               # React frontend (built to client/dist)
└── vercel.json           # Vercel configuration
```


---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### `POST /users/init`
Initialize or retrieve a user by device ID.

**Request Body:**
```json
{ "deviceId": "uuid-string" }
```

**Response:**
```json
{
  "_id": "uuid-string",
  "habit": null,
  "logs": []
}
```

---

#### `POST /habit/start`
Start a new 7-day habit challenge.

**Request Body:**
```json
{
  "deviceId": "uuid-string",
  "habitName": "Walk",
  "minVersion": "Walk 5 minutes"
}
```

**Response:** Updated user object with habit data.

---

#### `GET /habit/status?deviceId=<uuid>`
Get current habit status and progress.

**Response:**
```json
{
  "status": "active",        // "setup" | "active" | "completed"
  "dayNumber": 3,
  "hasLoggedToday": false,
  "habit": {
    "name": "Walk",
    "minVersion": "Walk 5 minutes",
    "startDate": "2026-01-01T00:00:00.000Z",
    "isActive": true
  }
}
```

---

#### `POST /habit/log`
Log daily check-in (once per day).

**Request Body:**
```json
{
  "deviceId": "uuid-string",
  "completed": true,
  "reason": "Had time before work"
}
```

**Response:** Updated user object with new log entry.

---

#### `GET /habit/summary?deviceId=<uuid>`
Get 7-day summary with insights.

**Response:**
```json
{
  "totalDays": 7,
  "completedDays": 5,
  "insight": "You're building momentum, but watch out for weekend slip-ups.",
  "logs": [
    { "date": "...", "completed": true, "reason": "..." },
    { "date": "...", "completed": false, "reason": "..." }
  ]
}
```

---

## 🔄 Application States

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌──────────┐      ┌──────────┐      ┌──────────────┐     │
│   │  SETUP   │ ───▶ │  ACTIVE  │ ───▶ │  COMPLETED   │     │
│   └──────────┘      └──────────┘      └──────────────┘     │
│        │                 │                   │              │
│        ▼                 ▼                   ▼              │
│   SetupView.jsx    DailyView.jsx      ResultView.jsx       │
│                          │                   │              │
│                          ▼                   │              │
│                   (done_today)               │              │
│                   "All done!"                │              │
│                          │                   │              │
│   ◀──────────────────────┴───────────────────┘              │
│                    (Restart)                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 Data Model

User data is stored in `server/data/users.json`:

```json
{
  "device-uuid-123": {
    "_id": "device-uuid-123",
    "habit": {
      "name": "Walk",
      "minVersion": "Walk 5 minutes",
      "startDate": "2026-01-01T06:00:00.000Z",
      "isActive": true
    },
    "logs": [
      {
        "date": "2026-01-01T18:30:00.000Z",
        "completed": true,
        "reason": "Morning routine worked well"
      },
      {
        "date": "2026-01-02T19:00:00.000Z",
        "completed": false,
        "reason": "Too tired after work"
      }
    ]
  }
}
```

---

## 🎨 UI/UX Features

- **Smooth animations** — Fade-in transitions between views
- **Mobile responsive** — Works on all screen sizes
- **Minimal design** — Focused, distraction-free interface
- **Motivational quotes** — Subtle reminders throughout the journey
- **Color-coded buttons** — Green for Yes, Red for No

---

## 🔧 Development Notes

### Why JSON instead of MongoDB?
- **Zero setup required** — No database installation needed
- **Easy to debug** — Just open the JSON file
- **Perfect for demos** — Works immediately after npm install
- **Can migrate later** — The model uses MongoDB-like API patterns

### Key Design Decisions
1. **Single habit focus** — Forces users to prioritize
2. **7-day blocks** — Long enough to build momentum, short enough to stay committed
3. **Minimum version required** — Reduces friction and excuses
4. **Reflection prompts** — Builds self-awareness about blockers

---

## 📝 License

MIT

---

## 🙏 Acknowledgments

Built for the **Entrext 48-Hour Build Assignment**.

Inspired by:
- James Clear's *Atomic Habits*
- BJ Fogg's *Tiny Habits*
- The "2-minute rule" for habit formation

---

*Made with ❤️ for anyone who wants to stop just learning and start doing.*
