# 🌍✈️ WorldVisit - Travel Tracking App

A modern travel tracking application with city management, interactive map, and travel journal.

### [Live Demo](https://city-marker.onrender.com/)

## Features

- 🗺️ Interactive map with city markers
- 🌆 City details and notes
- 📅 Travel date tracking
- 📸 Photo uploads for memories
- 🔐 4-digit PIN sign-in over Firebase anonymous auth
- ⚡ Live sync — every change lands in Firebase and appears in other tabs instantly
- 🌓 Dark theme by default

## 🛠️ Technologies Used

⚛️ React.js (Vite)

🔥 Firebase (Realtime Database + Anonymous Auth)

🗺️ Leaflet.js (Interactive maps)

🎨 Tailwind CSS (Styling)

🔄 React Router (Navigation)

📡 Context API (State management)

## 🔐 How sign-in works

There are no emails and no passwords. Signing up means picking a **4-digit
PIN**, and that PIN *is* the account:

- `signInAnonymously()` gets a real Firebase credential, which is what the
  database rules check — without it, every read and write is rejected.
- The PIN selects which travel log to open (`profiles/{pin}`), so the same PIN
  reaches the same cities from any browser or device.
- The PIN is kept in `localStorage`, so a page refresh doesn't sign you out.

**This is deliberately low-security.** 10,000 PINs exist, any signed-in visitor
who guesses one can read that log, and a PIN cannot be recovered if forgotten.
That's the right trade-off for a demo travel journal — don't store anything
private in it. For real accounts, swap `signInAnonymously` for
`signInWithEmailAndPassword` and key profiles on `auth.uid` instead of the PIN.

## 🚀 Getting started

```bash
npm install
cp .env.example .env   # then fill in your Firebase values
npm run dev
```

### Firebase setup

If you're pointing this at a fresh Firebase project:

1. **Create the database** — Firebase console → Build → Realtime Database →
   *Create database*. Any region works; single-region is cheapest.
2. **Enable anonymous sign-in** — Authentication → Sign-in method → Anonymous →
   *Enable*. Sign-in fails with a clear on-screen message until you do.
3. **Copy the web config** — Project settings → General → Your apps → SDK setup
   and configuration → *Config*, then paste each value into `.env`. These values
   are meant to ship in the client bundle; the rules are what protect the data.
4. **Deploy the rules** — `firebase deploy --only database`.

### Data shape

```
profiles/
  1234/                      <- the 4-digit PIN
    createdAt, lastLoginAt
    cities/
      -PabcXYZ.../           <- database push key, used as the city id
        cityName, country, emoji, date, notes
        position: { lat, lng }
        image                <- optional base64 JPEG, resized to 400px
        createdAt
```

`database.rules.json` denies everything by default, then allows an
authenticated session to read and write a 4-digit profile, validates every city
field's type and length, and range-checks coordinates.

### Where the Firebase code lives

Everything that talks to Firebase sits in `src/services/`, so swapping the
Realtime Database for Firestore (or anything else) means rewriting those three
files and nothing else:

| File | Responsibility |
| --- | --- |
| `services/firebase.js` | App init from env vars, `auth` and `db` handles |
| `services/profiles.js` | PIN validation, profile create / exists / touch |
| `services/cities.js` | City subscribe, fetch, create, update, delete |

### < Happy Traveling ! ✈️ 🌍/>
