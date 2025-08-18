import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout';
import RegistrationPage from './pages/RegistrationPage.jsx';
import Login from './pages/Login.jsx';
import DashboardLayout from './components/DashboardLayout';
import ForgotPassword from './pages/ForgotPassword';
import DashboardPage from './pages/DashboardPage';
import Courses from './pages/Courses';
import Progress from './pages/Progress';
import ProtectedRoute from './components/ProtectedRoute';
import CourseDetails from './pages/CourseDetails';
import Events from './pages/Events';
import NotificationBell from './components/NotificationBell';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './pages/LandingPage.jsx';
import BatchAdmin from './pages/BatchAdmin';
import Enrollments from './pages/Enrollments.jsx';
import Users from './pages/Users.jsx';
import Professors from './pages/Professors.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage';
import Tickets from './pages/Tickets';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import TermsOfUse from './pages/TermsOfUse';
import Profile from './pages/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#311188',
    },
  },
});

function AppRoutes({ isLoggedIn, setIsLoggedIn, showSplash, setShowSplash }) {
  const navigate = useNavigate();



  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowSplash(true);
    // Navigate to root to trigger splash screen
    navigate('/', { replace: true });
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    // After splash, redirect to the correct dashboard based on user role
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && (user.role === 'admin' || user.role === 'support')) {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error parsing user data in splash complete:', error);
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <Layout>
                <Login onLoginSuccess={handleLoginSuccess} />
              </Layout>
            ) : showSplash ? (
              <LandingPage onComplete={handleSplashComplete} />
            ) : (
              <ProtectedRoute>
                <DashboardLayout>
                  {(() => {
                    try {
                      const user = JSON.parse(localStorage.getItem('user'));
                      if (user && (user.role === 'admin' || user.role === 'support')) {
                        return <AdminDashboardPage />;
                      } else {
                        return <DashboardPage />;
                      }
                    } catch (error) {
                      console.error('Error parsing user data in root route:', error);
                      return <DashboardPage />;
                    }
                  })()}
                </DashboardLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route path="/register" element={<Layout><RegistrationPage /></Layout>} />
        <Route path="/login" element={<Layout><Login onLoginSuccess={handleLoginSuccess} /></Layout>} />
        <Route path="/forgotpassword" element={<Layout><ForgotPassword /></Layout>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AdminDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Courses />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CourseDetails />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Progress />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Events />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/batch"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BatchAdmin />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Enrollments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/professors"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Professors />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Tickets />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
      </Routes>
    </>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if user is already logged in on app startup
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  });
  const [showSplash, setShowSplash] = useState(() => {
    // If user is already logged in on startup, show splash
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  });

  useEffect(() => {
    if (isLoggedIn) {
      setShowSplash(true);
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AppRoutes
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          showSplash={showSplash}
          setShowSplash={setShowSplash}
        />
        <ToastContainer />
      </ThemeProvider>
    </Router>
  );
}

export default App;