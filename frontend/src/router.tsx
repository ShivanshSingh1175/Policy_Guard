import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import PoliciesPage from './features/policies/PoliciesPage';
import ScansPage from './features/scans/ScansPage';
import ViolationsPage from './features/violations/ViolationsPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'policies',
        element: <PoliciesPage />,
      },
      {
        path: 'scans',
        element: <ScansPage />,
      },
      {
        path: 'violations',
        element: <ViolationsPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
    ],
  },
]);
