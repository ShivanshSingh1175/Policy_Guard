import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import PoliciesPage from './features/policies/PoliciesPage';
import ScansPage from './features/scans/ScansPage';
import ViolationsPage from './features/violations/ViolationsPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import LoginPage from './features/auth/LoginPage';
import AccountsPage from './features/accounts/AccountsPage';
import SettingsPage from './features/settings/SettingsPage';
import CasesPage from './features/cases/CasesPage';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
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
        path: 'accounts',
        element: <AccountsPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'cases',
        element: <CasesPage />,
      },
    ],
  },
]);
