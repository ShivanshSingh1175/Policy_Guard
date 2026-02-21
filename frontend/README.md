# PolicyGuard Frontend

React + TypeScript frontend for the PolicyGuard compliance platform.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for UI components
- **React Router v6** for navigation
- **TanStack Query (React Query)** for data fetching and caching
- **Axios** for HTTP requests
- **Recharts** for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:5173 (or another port if 5173 is in use).

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
src/
├── api/
│   ├── client.ts              # Axios instance configuration
│   └── hooks/                 # React Query hooks
│       ├── useDashboard.ts
│       ├── usePolicies.ts
│       ├── useRules.ts
│       ├── useScans.ts
│       └── useViolations.ts
├── components/
│   └── common/                # Reusable components
│       └── MetricCard.tsx
├── features/                  # Feature-based organization
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── policies/
│   │   └── PoliciesPage.tsx
│   ├── scans/
│   │   └── ScansPage.tsx
│   ├── violations/
│   │   └── ViolationsPage.tsx
│   └── analytics/
│       └── AnalyticsPage.tsx
├── layouts/
│   └── MainLayout.tsx         # Main app layout with sidebar
├── types/
│   └── index.ts               # TypeScript interfaces
├── App.tsx                    # App root with providers
├── main.tsx                   # Entry point
├── router.tsx                 # Route configuration
└── theme.ts                   # MUI theme customization
```

## Features

### Dashboard
- Overview metrics (total violations, open violations, critical issues, active rules)
- Violations trend chart (last 7 days)
- Violations by severity chart
- Recent violations table

### Policies & Rules
- Upload policy PDFs
- View all policies
- View rules associated with each policy
- Toggle rules on/off
- View rule details (severity, collection, query)

### Scans
- Run new scans with collection filters
- View scan history
- See scan results (rules checked, violations found, duration)

### Violations
- Filter violations by severity and status
- View violation details
- Update violation status (Open, Confirmed, Dismissed, False Positive)
- Add reviewer notes

### Analytics
- Violations per day by severity (line chart)
- Top rules by violation count (bar chart)
- Top risky accounts table

## API Integration

The frontend currently uses mock data for development. To connect to the real FastAPI backend:

1. Ensure the backend is running on http://localhost:8000
2. Update the API hooks in `src/api/hooks/` to uncomment the real API calls
3. Remove or comment out the mock data returns

Example in `useDashboard.ts`:
```typescript
// Uncomment this:
const { data } = await apiClient.get<DashboardMetrics>('/dashboard/summary');
return data;

// Comment out this:
// return mockDashboardData;
```

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:8000
```

## Development

### Hot Reload
Vite provides instant hot module replacement (HMR). Changes to your code will be reflected immediately in the browser.

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Deployment

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy
The `dist/` folder can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- etc.

## Notes

- The app uses a dark theme by default (configured in `theme.ts`)
- All API calls go through the Axios client in `api/client.ts`
- React Query handles caching, refetching, and loading states
- The layout is responsive and works on mobile, tablet, and desktop
