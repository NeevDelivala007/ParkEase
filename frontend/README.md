# ParkEase — Frontend

React + TypeScript + Vite + Tailwind CSS + shadcn/ui-style components.

## Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/       # AppShell, Navbar, BottomNav, Logo, PageHeader, nav-items
│   │   └── ui/            # Button, Card, Badge, Input, Dialog, EmptyState, Spinner
│   ├── pages/              # Home, Map, AddParking, Bookings, Profile, NotFound
│   ├── routes/             # paths.ts (route constants), router.tsx (createBrowserRouter)
│   ├── lib/                # api.ts (axios client), queryClient.ts, utils.ts (cn helper)
│   ├── hooks/               # (empty — reserved for future stages)
│   ├── types/               # (empty — reserved for future stages)
│   ├── App.tsx              # QueryClientProvider + RouterProvider
│   ├── main.tsx              # ReactDOM root
│   ├── index.css             # Tailwind + design tokens
│   └── vite-env.d.ts
├── index.html
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── package.json
```

## Setup

```bash
cp .env.example .env
# defaults to http://localhost:4000/api which matches the backend's default PORT

npm install
npm run dev        # http://localhost:5173
```

## Routes (foundation stage)

| Path            | Page       | Status                                             |
|-----------------|------------|-----------------------------------------------------|
| `/`             | Home       | Hero + disabled search preview + USP teaser        |
| `/map`          | Map        | Polished "coming next stage" placeholder            |
| `/add-parking`  | Add Parking| Explains community submission flow, action disabled |
| `/bookings`     | Bookings   | Empty state                                          |
| `/profile`      | Profile    | Signed-out placeholder                               |
| `*`             | Not Found  | 404 page                                              |

All routes render inside `AppShell`, which provides the desktop top navbar,
the mobile bottom nav, and the responsive content area.

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — typecheck (`tsc -b`) then production build
- `npm run preview` — preview the production build
- `npm run typecheck` — `tsc --noEmit`

## Notes

- `src/lib/api.ts` is a pre-configured axios instance pointed at
  `VITE_API_BASE_URL`. It already attaches a bearer token from
  `localStorage` if one exists, so later auth work doesn't need to touch
  this file — but no requests are wired to real endpoints yet beyond what
  a later health-check widget might add.
- No business logic (booking, payments, map data, verification workflow,
  auth) is implemented at this stage — only the app shell, design system,
  routing and placeholder pages.
