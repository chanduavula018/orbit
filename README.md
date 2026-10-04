# 🪐 Orbit
> **Orbit — a simple idea of keeping your habits, tasks, and daily life moving in the right direction.**
Orbit is a mobile-first, offline-first productivity and habit-tracking application built with React 19, TypeScript, Vite, Tailwind CSS, and Capacitor. Designed around personal consistency and privacy, Orbit provides structured habit time windows, GitHub/LeetCode-style contribution heatmaps, dual-mode task lists (Calendar & General), full-text & canvas sketch notes, and intelligent notification scheduling — completely client-side with zero cloud dependency.
---
## 📱 App Preview
> *Note: Place your actual application screenshot files inside a `screenshots/` folder in the project root to render images below.*
<p align="center">
  <img src="screenshots/dashboard.png" alt="Orbit Dashboard" width="45%" />
  <img src="screenshots/tasks.png" alt="Orbit Tasks" width="45%" />
</p>
<p align="center">
  <img src="screenshots/notes.png" alt="Orbit Notes" width="45%" />
  <img src="screenshots/statistics.png" alt="Orbit Statistics" width="45%" />
</p>
<p align="center">
  <img src="screenshots/settings.png" alt="Orbit Settings" width="45%" />
</p>
---
## ✨ Overview
Orbit was built to address a common gap in productivity apps: the lack of strict completion timing rules and client-side data privacy. Instead of allowing arbitrary check-ins throughout the day, Orbit introduces **time-windowed habit completion** — unlocking habit check-ins exclusively during the final 5 minutes of a scheduled window.
### Key Highlights
- **100% Offline-First**: All data is stored locally in the browser or device using Dexie (IndexedDB). No user tracking, no backend servers, no mandatory account sign-up.
- **Rhythm & Consistency**: Encourages genuine habit adherence by rewarding completion within designated time slots.
- **Dual Task System**: Keeps date-specific calendar deadlines strictly separated from standalone general checklists.
- **Cross-Platform**: Operates as a fast PWA web application and compiles natively to Android via Capacitor.
---
## 🚀 Features
### 🧠 Habit Tracking & Time Window Engine
- **Time Window Rules**: Define start and end times for habits (e.g., `06:00 – 06:30` or cross-midnight `23:30 – 00:15`).
- **Final 5-Minute Unlock**: Check-in button activates strictly during the final 5 minutes (`endTime - 5 minutes`).
- **Flexible Repeat Rules**: Daily, weekdays, weekends, or custom day selection.
- **Pause & Resume**: Temporarily pause habits without breaking streak calculations or marking days as missed.
### 📊 Progress & Statistics
- **Month-by-Month Contribution Grid**: 12-month GitHub/LeetCode-style heatmap grouped into strict calendar month blocks with exact day counts (28, 29, 30, or 31 days).
- **Streak Calculation**: Calculates current and longest consecutive completion streaks. Unscheduled days and paused habits do not break active streaks.
- **Interactive Heatmap Cells**: Tap any date cell to view completion ratios, percentages, and scheduled habit statuses.
### 🗓️ Dual Task System
- **Calendar Tasks**: Attached to specific calendar dates. Displayed on a interactive month calendar grid with date indicator dots.
- **My Tasks (General Checklist)**: Standalone to-do list NOT tied to calendar dates. General tasks do not create calendar dots and do not alter habit statistics.
### 📝 Notes & Canvas Sketching
- **Rich Text / Markdown Notes**: Organize notes by category and custom tags.
- **Integrated Drawing Canvas**: Built-in HTML5 canvas sketch editor with stroke color, line width, eraser, and clear tools for drawing hand-written notes or diagrams.
### 🔔 Smart Notifications
- **Ending Reminders**: Schedules local notifications at `endTime - 5 minutes` to alert users when their 5-minute completion window opens (`"{Habit} ends in 5 minutes"`).
- **Auto-Cancellation**: Automatically cancels pending ending notifications when a habit is completed early.
### 🎨 Theme & Customization
- **Global Light / Dark Theme**: Real-time theme switching driven by centralized CSS design tokens (`--background`, `--surface`, `--primary`, etc.).
- **Theme Persistence**: Theme preference (`light`, `dark`, or `system`) persists locally across app restarts.
### 📱 Android Integration
- **Capacitor Android Native Build**: Compiled native APK configuration.
- **Hardware Back Button Handler**: Prioritized back-button logic: dismisses open modals first, returns to Home tab second, and prompts double-press exit on the Home tab.
---
## 🧩 Habit Completion Logic
Orbit enforces a precise time-window completion rule defined in `src/domain/services/timeEngine.ts`:
$$\text{Completion Window Start} = \text{endTime} - 5 \text{ minutes}$$
```text
       [ Start Time ]                         [ End Time - 5m ]         [ End Time ]
--------------|---------------------------------------|----------------------|-------------> Time
   UPCOMING   |       ACTIVE (Locked Button)          | ACTIVE (Unlocked)    |   MISSED
 (Disabled)   |      "Unlocks in final 5 mins"        |  "Complete Now"      | (Disabled)
Status State Machine
UPCOMING: currentTime < startTime. Check-in disabled.
ACTIVE (Locked): startTime <= currentTime < (endTime - 5m). Habit is active, but completion check-in is locked.
ACTIVE (Unlocked): (endTime - 5m) <= currentTime <= endTime. Completion check-in enabled (canComplete = true).
MISSED: currentTime > endTime without completion. Check-in disabled.
COMPLETED: Habit checked in during the valid 5-minute window.
NOT_SCHEDULED: Unscheduled day or habit is paused.
Cross-Midnight Window Support
Supports habits spanning past midnight (e.g., 23:30 to 00:15). Unlocks check-in during the final 5 minutes (00:10 to 00:15).

📈 Statistics & Streaks
Habit analytics are calculated strictly from real completion records (src/domain/services/streakEngine.ts and statsEngine.ts):

Current Streak: Number of consecutive scheduled days completed working backwards from today.
Longest (Max) Streak: Maximum consecutive completed scheduled days over the habit's lifetime.
Total Active Days: Unique dates within the selected period on which at least one scheduled habit was completed.
Completion Rate:
Completion Rate (%)
=
(
Completed Opportunities
Total Scheduled Opportunities
)
×
100
Completion Rate (%)=( 
Total Scheduled Opportunities
Completed Opportunities
​
 )×100
Note: Unscheduled days (e.g., weekends for weekday-only habits) and paused dates are excluded from scheduled opportunities and DO NOT break streaks.

🗓️ Tasks
Orbit separates tasks into two independent models (src/data/models/task.ts):

Task Type	Date Attachment	Calendar Dots	Affects Habit Stats	Purpose
Calendar Tasks	Yes (date: YYYY-MM-DD)	Yes	No	Specific date-bound deadlines & scheduled tasks
General Tasks	No	No	No	Standalone checklist & floating to-dos
📝 Notes & Sketches
Notes are managed via Dexie storage (src/data/models/note.ts):

Text Content: Full note title, body, category, and tags.
Canvas Sketch Data: Hand-drawn canvas strokes saved locally as Base64 data URLs (sketchData). Users can sketch, erase, and save hand-drawn notes alongside text.
🔔 Notifications
Local notifications are managed via Capacitor LocalNotifications (src/domain/services/notificationService.ts):

Trigger: Scheduled at endTime - 5 minutes.
Title: {icon} {name} ends in 5 minutes
Body: Habit ends in 5 minutes. You can complete it now.
Idempotency & Cancellation: Generates stable notification IDs (hash(habitId + date)). Calls cancelHabitEndingNotification when a habit is completed before the timer fires.
📴 Offline-First Architecture
Orbit is 100% offline-first and requires no internet connection:

text


┌─────────────────────────────────────────────────────────────┐
│                       React 19 UI                           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  Domain / Service Layer                     │
│    (timeEngine, streakEngine, statsEngine, notifications)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Data Storage Layer                       │
│              (StorageRepository / Dexie DB)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  IndexedDB (Browser / Device)               │
│      [habits]  [completions]  [tasks]  [notes]  [settings]  │
└─────────────────────────────────────────────────────────────┘
Data Safety: All records stay on the device.
JSON Import / Export: Users can export full database backups as a .json file and restore them anytime via Settings.
📂 Project Structure
text


Orbit/
├── android/                   # Capacitor Native Android project
├── public/                    # Static assets & web icons
├── src/
│   ├── core/                  # Utility functions & date helpers
│   │   ├── constants/         # Default constants & category options
│   │   └── utilities/         # Date formatting & schedule utilities
│   ├── data/                  # Data access layer & TypeScript models
│   │   ├── database/          # Dexie IndexedDB instance & StorageRepository
│   │   └── models/            # Entity interfaces (Habit, Task, Note, etc.)
│   ├── domain/                # Business logic & calculation engines
│   │   ├── services/          # Time, streak, stats & notification engines
│   │   └── __tests__/         # Vitest unit test suite
│   ├── presentation/          # User Interface layer
│   │   ├── components/        # Reusable React components & Modals
│   │   ├── context/           # HabitContext & SettingsContext
│   │   ├── navigation/        # BottomNav navigation bar
│   │   └── screens/           # Main tab screens (Dashboard, Tasks, Notes, etc.)
│   ├── App.tsx                # Main App component & back-button handler
│   ├── index.css              # Tailwind CSS v4 & theme design tokens
│   └── main.tsx               # Application entry point
├── capacitor.config.json      # Capacitor configuration
├── package.json               # Dependencies & build scripts
├── vite.config.ts             # Vite build configuration
└── README.md                  # Documentation
🛠️ Tech Stack
Category	Technology	Version	Purpose
Framework	React	19.2.8	User Interface library
Language	TypeScript	6.0.2	Type-safe application logic
Build Tool	Vite	8.3.0	Fast development server & production bundler
Styling	Tailwind CSS	4.3.3	Utility-first styling & dark mode design tokens
Icons	Lucide React	1.49.0	Application icon set
Database	Dexie.js	4.4.6	IndexedDB wrapper for local data persistence
Mobile Runtime	Capacitor	8.5.2	Cross-platform Native Android container
Notifications	@capacitor/local-notifications	8.3.1	Native & web local notifications
App Bridge	@capacitor/app	8.1.2	Hardware back button & app lifecycle listener
Date Processing	date-fns	4.4.0	Date math & interval calculations
Animations	canvas-confetti	1.9.4	Completion celebration particle effects
Testing	Vitest	5.0.3	Unit test runner
🧪 Testing
Orbit includes unit tests covering habit status transitions, time window validation, cross-midnight logic, streak calculations, and task isolation.

Run unit tests via Vitest:

bash


npx vitest run
⚡ Getting Started
Prerequisites
Node.js: v18+ or v20+
npm: v9+
Android Studio (optional, for compiling Android APK)
Installation
Clone the repository:

bash


git clone https://github.com/your-username/orbit.git
cd orbit
Install dependencies:

bash


npm install
Start local development server:

bash


npm run dev
Open http://localhost:5173 in your browser.

Build production web assets:

bash


npm run build
Building for Android
Sync Capacitor web assets:

bash


npx cap sync android
Compile Android Debug APK:

bash


cd android
.\gradlew.bat assembleDebug
The compiled APK will be located at android/app/build/outputs/apk/debug/app-debug.apk.

📄 License
This project is licensed under the MIT License — see the 
LICENSE
 file for details.
