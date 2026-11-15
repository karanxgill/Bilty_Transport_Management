# BiltyFlow transport workspace

This is the separate redesign copy. It includes the homepage refresh, expanded bilty details, and account-specific consignment-note PDF design.

## Run the app

Use Node.js 22.12 or newer. Install dependencies in both packages with `npm ci` from `TM_Backend` and `TM_Frontend`. Copy each `.env.example` to a local env file; keep the database URL private and use a freshly generated `JWT_SECRET` with at least 32 random bytes.

Apply the new per-account PDF settings and bilty-detail columns before starting the backend:

```sh
cd TM_Backend
npx prisma migrate deploy
npm run dev
```

In another terminal:

```sh
cd TM_Frontend
npm run dev
```

Open **PDF design** in the workspace sidebar to set the carrier identity, logo, field names, terms, visibility, numbering, paper size and orientation. Each bilty’s **Download PDF** action opens the browser print dialog; choose **Save as PDF** there.

## Vercel deployment

Deploy the two applications as separate Vercel projects from this repository:

- Frontend project root: `TM_Frontend` (Vite preset). Its `vercel.json` proxies `/api/*` to the API and serves the SPA for client-side routes.
- Backend project root: `TM_Backend` (Express preset). Its build script generates Prisma Client and compiles TypeScript; `src/app.ts` exports the Express app for Vercel.

Configure these backend Production environment variables in Vercel:

- `DATABASE_URL`: the PostgreSQL connection string.
- `JWT_SECRET`: a newly generated random secret with at least 32 bytes.
- `FRONTEND_ORIGINS`: `https://bilty-transport-management-frontend.vercel.app` (the exact frontend origin; no path or query).
- `TRUST_PROXY`: `1` when the API is behind one trusted Vercel proxy hop.

Apply Prisma migrations to the intended database before directing production traffic. The existing `20261003105340_added` migration differs from the data-preserving version used by the previous checkout. Do not change or re-run migrations against a database until its `_prisma_migrations` history has been checked; an already-applied migration can fail on checksum mismatch, while the older version can fail on a populated database.

After both deployments are ready, visit `/health` on the API; it should return `{"status":"ok"}` only after a database query succeeds. Confirm the frontend domain and API proxy point at the same projects before inviting users.


## Frontend source layout

```text
TM_Frontend/src/
├── app/                 # Routing and protected-route composition
├── features/            # Pages, components, data, and domain logic by feature
│   ├── auth/
│   ├── bilties/          # Bilty pages and PDF generation
│   ├── customers/
│   ├── dashboard/
│   ├── documents/        # Account-specific PDF settings
│   ├── home/
│   ├── settings/
│   └── vehicles/
├── shared/               # Reusable components, API, types, and global styles
└── main.tsx               # Vite entry point
```

Use `npm run format` from `TM_Frontend/` to format handwritten frontend and backend TypeScript/CSS. Generated Prisma client files are excluded.
