import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import AiroErrorBoundary from '../dev-tools/src/AiroErrorBoundary';
import CookieBannerErrorBoundary from '@/components/CookieBannerErrorBoundary';
import RootLayout from './layouts/RootLayout';
import Spinner from './components/Spinner';
import HomePage from './pages/index';
import { ProtectedRoute } from '@/lib/auth/auth-client';

const isDevelopment = import.meta.env.MODE === 'development';
const NotFoundPage = isDevelopment
  ? lazy(() => import('../dev-tools/src/PageNotFound'))
  : lazy(() => import('./pages/_404'));

const ProducePage = lazy(() => import('./pages/produce'));
const BulkExportPage = lazy(() => import('./pages/bulk-export'));
const FarmerDashboardPage = lazy(() => import('./pages/farmer-dashboard'));
const FarmersPage = lazy(() => import('./pages/farmers'));
const CartPage = lazy(() => import('./pages/cart'));
const ProfilePage = lazy(() => import('./pages/profile'));
const LoginPage = lazy(() => import('./pages/login'));
const SignupPage = lazy(() => import('./pages/signup'));

const CookieBanner = lazy(() =>
  import('@/components/CookieBanner').catch((error) => {
    console.warn('Failed to load CookieBanner:', error);
    return { default: () => null };
  })
);

const SpinnerFallback = () => (
  <div className="flex justify-center py-8 h-screen items-center">
    <Spinner />
  </div>
);

// Create router with layout wrapper
const router = createBrowserRouter([
  {
    path: '/',
    element: import.meta.env.MODE === 'development' ? (
      <AiroErrorBoundary>
        <Suspense fallback={<SpinnerFallback />}>
          <RootLayout>
            <Outlet />
          </RootLayout>
        </Suspense>
      </AiroErrorBoundary>
    ) : (
      <Suspense fallback={<SpinnerFallback />}>
        <RootLayout>
          <Outlet />
        </RootLayout>
      </Suspense>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/produce', element: <ProducePage /> },
      { path: '/bulk-export', element: <BulkExportPage /> },
      {
        path: '/farmer-dashboard',
        element: (
          <ProtectedRoute>
            <FarmerDashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: '/farmers', element: <FarmersPage /> },
      { path: '/cart', element: <CartPage /> },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <CookieBannerErrorBoundary>
        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>
      </CookieBannerErrorBoundary>
    </>
  );
}
