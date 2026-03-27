# 🔥 HabitForge — Full Stack Habit Tracker

A premium, full-featured habit tracking application with a stunning dark UI, built with React + Node.js + MongoDB.

## ✨ Features

- **🏠 Dashboard** — Overview with stats, weekly chart, activity heatmap, and quick actions
- **⚡ Habit Tracking** — Create habits with icons, colors, categories; track daily completions, streaks & rates
- **📅 Timetable** — Daily time-block schedule with checkboxes, monthly streak calendar, and compliance rate
- **✅ Task Manager** — Full todo app with List & Kanban views, priorities, due dates, subtasks
- **🔥 Transformation Challenges** — 21/30/75/100/365-day challenges with day grids, milestones & mood logging
- **📊 Analytics** — Charts: area, bar, pie, radar. Habit performance, streak distribution, category radar
- **👤 Profile** — Edit name, bio; account management

## 🛠️ Tech Stack

**Frontend:** React 18, React Router 6, Recharts, React Hot Toast
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT Auth, bcryptjs
**Design:** Custom CSS, Google Fonts (Syne + DM Sans + JetBrains Mono), dark theme

## 🚀 Setup

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Setup

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/habittracker
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
```

For MongoDB Atlas, replace MONGO_URI with your connection string.

### 3. Run

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```

Visit: **http://localhost:3000**

## 📁 Project Structure

```
habittracker/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # All page components
│       ├── context/        # AuthContext
│       ├── utils/          # API helper
│       └── styles/         # Global CSS
└── server/                 # Express backend
    ├── controllers/        # Route handlers
    ├── middleware/         # JWT auth
    ├── models/             # Mongoose schemas
    └── routes/             # API routes
```

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/habits | Get all habits |
| POST | /api/habits | Create habit |
| POST | /api/habits/:id/toggle | Toggle completion |
| GET | /api/timetable | Get schedule |
| POST | /api/timetable/:id/toggle | Check off slot |
| GET | /api/tasks | Get tasks |
| GET | /api/transformation | Get challenges |
| POST | /api/transformation/:id/log | Log a challenge day |
| GET | /api/stats/dashboard | Dashboard stats |

## 🎨 Design System

- **Colors:** Deep dark bg (#0a0a0f), orange accent (#ff6b35), purple (#8b5cf6), cyan (#06b6d4)
- **Fonts:** Syne (headings), DM Sans (body), JetBrains Mono (numbers/code)
- **Border radius:** 8px–24px scale
- **Animations:** fade-in-up, glow pulses, smooth transitions

---

Built with ❤️ using the MERN stack.
