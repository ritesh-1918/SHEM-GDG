import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { EnergyDataProvider } from './hooks/EnergyDataContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import PageLoader from './components/ui/PageLoader.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Lazy Load Pages
const LandingPage = lazy(() => import('./components/LandingPage.jsx'));
const LoginPage = lazy(() => import('./components/LoginPage.jsx'));
const RegistrationForm = lazy(() => import('./components/auth/RegistrationForm.jsx'));
const Dashboard = lazy(() => import('./components/Dashboard.jsx'));
const WelcomePage = lazy(() => import('./components/WelcomePage.jsx'));
const PrivacyPolicy = lazy(() => import('./components/Legal/PrivacyPolicy.jsx'));
const TermsAndConditions = lazy(() => import('./components/Legal/TermsAndConditions.jsx'));
const MetaTags = lazy(() => import('./components/MetaTags.jsx'));
const Documentation = lazy(() => import('./components/Documentation.tsx'));
const Support = lazy(() => import('./components/Support.tsx'));

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <EnergyDataProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <MetaTags />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegistrationForm />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                  <Route path="/docs" element={<Documentation />} />
                  <Route path="/support" element={<Support />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard/*"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/welcome"
                    element={
                      <ProtectedRoute>
                        <WelcomePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </EnergyDataProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;