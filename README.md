# 🌍✈️ WorldVisit - Travel Tracking App

A modern travel tracking application with city management, interactive map, and travel journal.

### [Live app](https://world-visit-snapshots.netlify.app/)

## Features

- 🗺️ Interactive map: tap anywhere to drop a pin, confirm to add that City
- 🔍 Search your saved Cities, or any place on Earth via OpenStreetMap
- 📱 Built for a phone: Map and List views with a bottom bar and a menu
- 🏠 Installs to an iOS or Android home screen and opens standalone
- 🌆 City details and notes
- 📅 Travel date tracking
- 📸 Up to five photo Memories per City
- 🔐 Username + 4-digit PIN sign-in, with the PIN verified by the database rules
- ⚡ Live sync — every change lands in Firebase and appears in other tabs instantly
- 🌓 Dark theme by default

## 🛠️ Technologies Used

⚛️ React.js + TypeScript (Vite)

🔥 Firebase (Realtime Database + Anonymous Auth)

🗺️ Leaflet.js (Interactive maps)

🎨 Tailwind CSS (Styling)

🔄 React Router (Navigation)

📡 Context API (State management)

## 🔐 How sign-in works

You sign up with a **username** and a **4-digit PIN**, and log back in with the
same two. No email, no email verification.

- `signInAnonymously()` supplies a real Firebase credential. Without it every
  read and write is rejected, so it is what makes the rules enforceable at all.
- The **username** identifies the account (`users/{username}`). It is stored
  lowercased as the database key, so `Youssef` and `youssef` are the same login.
- The **PIN is the secret, and the client never sees it.** It is stored at
  `users/{username}/pin`, which has no read rule at all — not even for the
  account's owner.

### The PIN is checked by the database, not by JavaScript

Logging in writes `{ username, pin }` to `sessions/{uid}`. That write has a
`.validate` rule:

```
root.child('users/' + newData.child('username').val() + '/pin').val()
  === newData.child('pin').val()
```

So a wrong PIN fails with `PERMISSION_DENIED` from Firebase itself. Cities are
then gated on the session that write created:

```
".read": "root.child('sessions/' + auth.uid + '/username').val() === $username"
```

Which means the browser never downloads a PIN or a hash to compare, and there is
nothing to brute-force offline. Verified with an authenticated REST read while
signed in as a second account:

```
GET /users/maria/cities.json?auth=<maria's token>    -> 200
GET /users/youssef/cities.json?auth=<maria's token>  -> 401 Permission denied
GET /users/youssef/pin.json?auth=<maria's token>     -> 401 Permission denied
```

The session lives in the database keyed by the anonymous uid, so a page refresh
restores it and **nothing sensitive is kept in `localStorage`**.

### What this still doesn't protect against

A 4-digit PIN is 10,000 guesses, and the rules do not rate-limit login attempts,
so an attacker who knows a username could grind through them online. Usernames
are also enumerable, since sign-up has to be able to tell you a name is taken.
Fine for a demo travel journal — don't store anything private in it. For real
accounts, use Firebase's Email/Password provider and key `users/` on `auth.uid`.

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

### Deploying (Netlify)

`netlify.toml` covers the two things a Vite SPA needs on a static host:

- **A catch-all rewrite to `index.html`.** The app uses `BrowserRouter`, so
  without it, loading or refreshing `/login` or `/app/cities` directly 404s.
- **`SECRETS_SCAN_OMIT_KEYS` for the seven `VITE_FIREBASE_*` keys.** Vite inlines
  every `VITE_*` value into the client bundle at build time, so these are public
  the moment the page loads — that is by design for Firebase web config, and
  `database.rules.json` is what actually protects the data. Netlify's secrets
  scanner assumes any env var is a secret and fails the deploy when it finds one
  in the output, so the keys are declared as non-secret.

Set the seven variables in the host's build environment (Netlify: Site
configuration → Environment variables). They are needed at **build** time, not
runtime — a Vite build with them missing produces a bundle that can't reach
Firebase, and the login screen will say so.

### Data shape

```
users/
  youssef/                   <- lowercased username, the account key
    pin: "1234"              <- no read rule anywhere; never leaves the server
    profile/                 <- readable, so signup can check availability
      displayName: "Youssef" <- the casing as typed
      createdAt, lastLoginAt
    cities/
      -PabcXYZ.../           <- database push key, used as the city id
        cityName, country, emoji, date, notes
        position: { lat, lng }
        memories/            <- up to five base64 JPEGs, long side 800px
          -PdefUVW...        <- push key, used as the memory id
        image                <- the old single photo; read as the first
                                Memory, and moved into memories/ on the
                                next write. New records never have it.
        createdAt

sessions/
  {anonymous uid}/           <- proof that this browser knows the PIN
    username, pin            <- the write is rejected unless the PIN matches
```

### TypeScript

The whole `src` tree is TypeScript in `strict` mode, with `allowJs` off.
`src/types.ts` is the one place a city is described:

| Type | Used for |
| --- | --- |
| `City` | what the UI reads, id and Memories included |
| `Memory` | one photo on a City: an id and a base64 data URI |
| `NewCity` | what the form submits, before an id exists |
| `CityUpdate` | a partial edit; Memories are changed through their own operations |
| `StoredCity` | the shape actually sitting in the database |
| `Country` | a country rolled up from the city list |

```bash
npm run typecheck   # tsc --noEmit
npm run lint
npm test -- --run   # Vitest on jsdom, once
npm run build       # typechecks, then builds
```

### Tests

`src/test/` holds the fixtures rather than the tests for one component:
`renderApp` mounts the `/app` routes with a fixed Account, seeded Cities and a
phone or wide viewport, backed by an in-memory fake of the cities service, so
no test touches Firebase or the network. Leaflet cannot lay out in jsdom, so
the map is stubbed there and its logic is tested separately as plain functions
in `src/map/mapBehaviour.ts`, which imports nothing from Leaflet on purpose.

`database.rules.json` denies everything by default, then allows a
session that has proved its PIN to read and write that account, validates every
city field's type and length, and range-checks coordinates.

### Where the Firebase code lives

Everything that talks to Firebase sits in `src/services/`, so swapping the
Realtime Database for Firestore (or anything else) means rewriting those three
files and nothing else:

| File | Responsibility |
| --- | --- |
| `services/firebase.ts` | App init from env vars, `auth` and `db` handles |
| `services/users.ts` | Username/PIN rules, account create, session open/close |
| `services/cities.ts` | City subscribe, fetch, create, update, delete, Memories |

`services/geocoding.ts` is the one other outside call: it names the place at a
Position, shared by the Add City form and the map's "Add ‹place›?" popup so the
two cannot disagree about what you tapped.

### Country boundaries

The map includes Natural Earth's public-domain 1:50m Admin 0 country
boundaries, reduced to geometry and Natural Earth's `ISO_A2_EH` identifiers.
Country fills derive from the existing `emoji` country-code field on each saved City;
no City records are migrated or rewritten. Natural Earth requests the courtesy
credit Made with Natural Earth. The source URL and license details are in
[`src/map/data/NATURAL_EARTH.md`](src/map/data/NATURAL_EARTH.md).

### Why photos live in the database

Cloud Storage for Firebase has required the paid Blaze plan for every bucket
since February 2026, so a project on the no-cost Spark plan cannot use it.
Memories are therefore base64 JPEGs inside the City record, resized in the
browser to 800px on the long side. See
[ADR-0001](docs/adr/0001-memories-stored-as-base64-in-realtime-database.md) for
the full reasoning and the point at which it is worth revisiting.

### < Happy Traveling ! ✈️ 🌍/>
