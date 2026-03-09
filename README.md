# AdminPro — Enterprise Back-Office Dashboard

A full-stack enterprise dashboard built with **Analog v2** (Angular meta-framework), **AG Grid Enterprise**, **NgRx SignalStore**, **Chart.js**, and **Drizzle ORM**. Features drag-and-drop dashboard building, server-side data grids with inline editing, role-based access control, and real-time audit logging.

Built as part of a [10-project portfolio](https://github.com/briang7) spanning Angular, React, Vue, Svelte, Preact, Astro, Lit, .NET, Go, and Python.

---

## Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Meta-Framework** | Analog v2 (beta) | File-based routing, SSR, Nitro server |
| **Frontend** | Angular 19 | Standalone components, signals, zoneless-ready |
| **State** | NgRx SignalStore v19 | `signalStore()`, `withState`, `withMethods`, `withEntities` |
| **Data Grid** | AG Grid Enterprise v35 | Server-side row model, inline editing, custom renderers |
| **Charts** | Chart.js 4 / ng2-charts | Line, doughnut, bar — dark-themed with animations |
| **Drag & Drop** | Angular CDK v19 | Dashboard widget placement & reordering |
| **Styling** | Tailwind CSS 4 | `@tailwindcss/vite` plugin, dark theme throughout |
| **Server** | Nitro / h3 | REST API routes colocated with Angular pages |
| **ORM** | Drizzle ORM 0.45 | Type-safe PostgreSQL schema, relations, queries |
| **Database** | PostgreSQL 16 | Docker Compose for local dev |
| **Auth** | JWT + bcryptjs | httpOnly cookies, middleware-based auth parsing |
| **Deployment** | Docker + Firebase Hosting + Cloud Run | Multi-stage build, CI/CD via GitHub Actions |

---

## Features

### Dashboard Builder
- **Drag-and-drop** widget placement using Angular CDK (`CdkDrag`, `CdkDropList`)
- **KPI cards** with trend indicators (+12.5%, -3.2%), accent color coding, and gradient effects
- **Chart widgets** — Revenue trend (line with area fill), Orders by Status (doughnut), Customers by Tier (bar)
- **Date range filters** (7d / 30d / 90d / 1y) that refresh all dashboard data
- **Save/load layouts** to the database — name and persist custom configurations
- **Widget palette** sidebar for adding new widgets in edit mode

### Data Management — AG Grid Enterprise
Three server-side data grid pages with real PostgreSQL data:

| Page | Records | Features |
|------|---------|----------|
| **Customers** | 500 | Inline editing, status/tier dropdowns, revenue formatting, CSV export, multi-select |
| **Orders** | 2,000 | Status management, amount formatting, date filtering, pagination |
| **Products** | 200 | Price editing, stock management, category filtering |

All grids feature:
- Server-side row model with API-driven pagination
- Floating filters and column sorting
- Custom status cell renderer with color-coded badges
- Inline cell editing with auto-save to API
- Dark theme (`themeQuartz` + `colorSchemeDark`)

### User & Role Management
- **User CRUD** — Create users via slide-over panel, delete with confirmation
- **Role assignment** — Admin, Manager, Editor, Viewer roles
- **User detail page** (`/users/:id`) with profile and activity history
- **Role permissions editor** — Granular permission matrix
- **Audit log** — Tracks all create/update/delete actions with timestamp, user, and entity

### Authentication
- JWT tokens stored in **httpOnly cookies** (no localStorage)
- Login page with **demo account quick-fill** buttons
- Auth middleware parses tokens for all `/api/v1/` routes
- `requireAuth()` helper for protected endpoints

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Index | Redirects to `/dashboard` |
| `/auth` | Login | Sign-in form with demo accounts |
| `/dashboard` | Dashboard | KPI cards, charts, drag-and-drop builder |
| `/data/customers` | Customers | AG Grid with 500 customers |
| `/data/orders` | Orders | AG Grid with 2,000 orders |
| `/data/products` | Products | AG Grid with 200 products |
| `/users` | Users | User management with AG Grid |
| `/users/:id` | User Detail | Profile, role, activity |
| `/roles` | Roles | Role & permission editor |
| `/audit` | Audit Log | Action history with filters |
| `/settings` | Settings | Profile info, dark mode toggle |

---

## API Endpoints

All under `/api/v1/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Authenticate user, set cookie |
| POST | `/auth/logout` | Clear auth cookie |
| GET | `/auth/me` | Get current user profile |
| GET | `/customers` | List customers (paginated, sortable, filterable) |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer by ID |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| POST | `/customers/bulk` | Bulk operations |
| GET | `/orders` | List orders |
| GET | `/orders/:id` | Get order |
| PUT | `/orders/:id` | Update order |
| GET | `/products` | List products |
| PUT | `/products/:id` | Update product |
| GET | `/users` | List users |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/roles` | List roles with permissions |
| PUT | `/roles/:id` | Update role permissions |
| GET | `/audit` | Get audit log entries |
| GET | `/dashboard/stats` | Dashboard KPIs and chart data |
| GET | `/dashboard/configs` | Saved dashboard layouts |
| POST | `/dashboard/configs` | Save dashboard layout |

---

## Getting Started

### Prerequisites

- Node.js 22+
- Docker Desktop (for PostgreSQL)

### Setup

```bash
# Clone the repo
git clone https://github.com/briang7/adminpro.git
cd adminpro

# Install dependencies
npm install --legacy-peer-deps

# Start PostgreSQL via Docker
docker compose up -d

# Push database schema
npm run db:push

# Seed demo data (500 customers, 2000 orders, 200 products, 4 users, 4 roles)
npm run db:seed

# Start dev server
npm run dev
```

Visit **http://localhost:4201**

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@adminpro.dev | Demo123! |
| **Manager** | manager@adminpro.dev | Demo123! |
| **Editor** | editor@adminpro.dev | Demo123! |
| **Viewer** | viewer@adminpro.dev | Demo123! |

---

## Project Structure

```
adminpro/
├── src/
│   ├── app/
│   │   ├── pages/                        # 11 Analog file-based routes
│   │   │   ├── index.page.ts             # → /dashboard redirect
│   │   │   ├── auth.page.ts              # Login
│   │   │   ├── dashboard.page.ts         # Dashboard builder
│   │   │   ├── settings.page.ts          # Settings
│   │   │   ├── audit.page.ts             # Audit log
│   │   │   ├── roles.page.ts             # Role management
│   │   │   ├── data/
│   │   │   │   ├── customers.page.ts     # AG Grid — Customers
│   │   │   │   ├── orders.page.ts        # AG Grid — Orders
│   │   │   │   └── products.page.ts      # AG Grid — Products
│   │   │   └── users/
│   │   │       ├── index.page.ts         # AG Grid — Users
│   │   │       └── [id].page.ts          # User detail
│   │   ├── components/
│   │   │   ├── dashboard-widgets/        # KPI card, chart, canvas, palette
│   │   │   ├── data-grid/               # AG Grid setup, status cell renderer
│   │   │   └── layout/                  # Sidebar, topbar, app-layout
│   │   ├── stores/                       # 7 NgRx SignalStores
│   │   │   ├── auth.store.ts
│   │   │   ├── ui.store.ts
│   │   │   ├── dashboard.store.ts
│   │   │   ├── entity.store.ts           # Generic entity store factory
│   │   │   ├── customers.store.ts
│   │   │   ├── orders.store.ts
│   │   │   └── products.store.ts
│   │   ├── guards/auth.guard.ts
│   │   └── services/auth.service.ts
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema.ts                # 8 Drizzle tables with relations
│   │   │   ├── index.ts                 # Lazy DB connection
│   │   │   └── seed.ts                  # Idempotent seed script
│   │   ├── routes/api/v1/               # 25+ REST API endpoints
│   │   │   ├── auth/                    # login, logout, me
│   │   │   ├── customers/               # CRUD + bulk
│   │   │   ├── orders/                  # List, get, update
│   │   │   ├── products/                # List, update
│   │   │   ├── users/                   # CRUD
│   │   │   ├── roles/                   # List, update permissions
│   │   │   ├── dashboard/               # Stats, saved configs
│   │   │   └── audit.get.ts             # Audit log
│   │   ├── middleware/auth.ts            # JWT parsing middleware
│   │   └── utils/
│   │       ├── auth.ts                  # JWT helpers, requireAuth
│   │       └── pagination.ts            # Shared pagination parser
│   └── styles.css                        # Tailwind CSS 4 entry
├── docker-compose.yml                    # PostgreSQL 16
├── Dockerfile                            # Multi-stage production build
├── firebase.json                         # Firebase Hosting config
├── .github/workflows/deploy.yml          # CI/CD pipeline
├── drizzle.config.ts
├── vite.config.ts                        # Analog + Tailwind plugins
└── package.json
```

---

## Database Schema

8 tables managed by Drizzle ORM:

- **users** — id, email, passwordHash, name, avatarUrl, roleId, lastLogin, timestamps
- **roles** — id, name, description, permissions (JSON), timestamps
- **permissions** — id, name, description (reference data)
- **customers** — id, company, contactName, email, phone, status, tier, revenue, timestamps
- **orders** — id, customerId, amount, status, itemsCount, notes, timestamps
- **products** — id, name, sku, price, stock, category, status, timestamps
- **auditLog** — id, userId, action, entity, entityId, details (JSON), timestamp
- **dashboardConfigs** — id, userId, name, config (JSON), timestamps

---

## Scripts

```bash
npm run dev          # Start Analog dev server (port 4201)
npm run build        # Production build
npm run db:push      # Push Drizzle schema to PostgreSQL
npm run db:seed      # Seed demo data
npm run test         # Run unit tests
npm run lint         # ESLint
```

---

## Architecture Highlights

- **Analog v2 (beta)** — `.page.ts` file convention for automatic route generation, Nitro server for API routes, SSR with Angular hydration
- **NgRx SignalStore** — Signal-based stores using `signalStore()`, `withState`, `withMethods`, `withComputed`, and a generic `createEntityStore<T>()` factory
- **AG Grid Server-Side Row Model** — API-driven pagination, sorting, and filtering — no client-side data loading
- **Dashboard Builder** — Angular CDK `CdkDrag`/`CdkDropList` with connected containers (palette → canvas), widget configurations persisted to database
- **Lazy DB Connection** — Proxy-based lazy initialization prevents Drizzle from connecting during Nitro module resolution (SSR-safe)
- **Auth Middleware Pattern** — Non-throwing middleware parses JWT cookies and sets `event.context.auth`; individual routes call `requireAuth()` when needed

---

## License

MIT
