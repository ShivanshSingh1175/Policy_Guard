import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import PoliciesPage from './features/policies/PoliciesPage';
import ScansPage from './features/scans/ScansPage';
import ViolationsPage from './features/violations/ViolationsPage';
import AnalyticsPage from './features/analytics/AnalyticsPage';
import LoginPage from './features/auth/LoginPage';

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
        path: 'analytics',
        element: <AnalyticsPage />,
      },
    ],
  },
]);
