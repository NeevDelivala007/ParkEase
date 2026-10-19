# ParkEase — Backend

Node.js + Express + TypeScript + Prisma + PostgreSQL.

## Structure

```
backend/
├── prisma/
│   └── schema.prisma       # DB models (User, ParkingSpot) — foundation only
├── src/
│   ├── config/
│   │   └── env.ts          # validated environment variables (zod)
│   ├── controllers/
│   │   └── health.controller.ts
│   ├── lib/
│   │   ├── AppError.ts     # operational error class
│   │   ├── asyncHandler.ts # wraps async route handlers
│   │   └── prisma.ts       # shared PrismaClient instance
│   ├── middleware/
│   │   └── errorHandler.ts # centralized error + 404 handling
│   ├── routes/
│   │   ├── health.routes.ts
│   │   └── index.ts        # mounts all feature routers under /api
│   ├── app.ts               # express app factory (middleware, routes)
│   └── index.ts             # server entrypoint
├── .env.example
├── package.json
└── tsconfig.json
```

## Setup

Requires a running PostgreSQL instance (local, Docker, or hosted).

```bash
cp .env.example .env
# edit .env and set DATABASE_URL, JWT_SECRET, etc.

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

The server starts on `http://localhost:4000` (configurable via `PORT`).

## Endpoints (foundation stage)

| Method | Path              | Purpose                                   |
|--------|-------------------|--------------------------------------------|
| GET    | `/`               | API root / welcome message                |
| GET    | `/api/health`     | Liveness check (no DB access)             |
| GET    | `/api/health/ready` | Readiness check — verifies DB connectivity |

## Scripts

- `npm run dev` — start with hot reload (`tsx watch`)
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled build
- `npm run typecheck` — `tsc --noEmit`
- `npm run prisma:generate` / `prisma:migrate` / `prisma:studio`

## Notes

- Image storage is provider-agnostic via `IMAGE_STORAGE_PROVIDER`
  (`cloudinary` or `local`). The foundation stage only wires the config;
  actual upload logic is added alongside the Add Parking feature.
- No business logic (booking, payments, verification workflow, dashboards)
  is implemented at this stage — only the app shell, health check, and DB
  connection.
