# ParkEase

**Find parking. Discover parking.**

ParkEase is a smart parking discovery platform that combines three sources of
parking capacity into a single map-based experience:

1. **Public / Municipal parking** — official, publicly managed parking locations.
2. **Private / Society parking** — spare capacity shared by societies, apartments,
   offices and businesses during permitted time windows.
3. **Community-discovered parking** — legally/permissibly usable spots that
   drivers find and submit themselves. These start out as `COMMUNITY_SUBMITTED`
   and only become `COMMUNITY_VERIFIED` after other users and/or an
   administrator confirm them.

> ParkEase helps drivers discover legal/permitted and previously overlooked
> parking capacity, reducing unnecessary searching and circulation for parking.
> It does **not** encourage illegal, obstructive, or unauthorized parking, and
> it never represents a submission as verified or legally authorized until it
> actually has been.

This repository is a monorepo with two independent apps:

```
parkease/
├── frontend/   React + TypeScript + Vite + Tailwind + shadcn/ui
└── backend/    Node.js + Express + TypeScript + Prisma + PostgreSQL
```

## Current stage: FOUNDATION ONLY

This stage sets up the application shell, navigation, design system, API
client, and backend skeleton (routing/controller/service structure, error
handling, health check, Prisma + PostgreSQL wiring). No business logic
(booking, payments, community verification, dashboards, map logic) has been
implemented yet — those are later stages.

See `frontend/README.md` and `backend/README.md` for how to run each app.

## Quick start

```bash
# 1. Backend
cd backend
cp .env.example .env      # then fill in your DATABASE_URL etc.
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev                # http://localhost:4000

# 2. Frontend (in a second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Once both are running, open the frontend — the Home page pings the backend's
`/api/health` endpoint and shows connection status live.
