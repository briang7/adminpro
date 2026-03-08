# AdminPro - Enterprise Back-Office Dashboard

Full-stack enterprise dashboard built with Analog (Angular meta-framework), AG Grid Enterprise, NgRx SignalStore, Chart.js, and Drizzle ORM.

## Tech Stack

- **Frontend:** Analog v2, Angular 19, Tailwind CSS 4, AG Grid Enterprise, Chart.js/ng2-charts, Angular CDK
- **State:** NgRx SignalStore
- **Backend:** Analog/Nitro server routes (h3)
- **Database:** PostgreSQL via Drizzle ORM
- **Auth:** JWT with httpOnly cookies

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start PostgreSQL
docker compose up -d

# Push schema & seed data
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

Visit http://localhost:4201

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@adminpro.dev | Demo123! |
| Manager | manager@adminpro.dev | Demo123! |
| Editor | editor@adminpro.dev | Demo123! |
| Viewer | viewer@adminpro.dev | Demo123! |
