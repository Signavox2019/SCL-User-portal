import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const theme = createTheme({
  palette: {
    primary: {
      main: '#311188',
    },
  },
});

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Layout><RegistrationPage /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
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
            path="/courses/:id"
            element={
              <DashboardLayout>
                <CourseDetails />
              </DashboardLayout>
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
        </Routes>
        <ToastContainer />
      </ThemeProvider>
    </Router>
  );
}

export default App;