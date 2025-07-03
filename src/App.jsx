import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout';
import RegistrationPage from './pages/RegistrationPage.jsx';
import Login from './pages/Login.jsx';
import DashboardLayout from './components/DashboardLayout';
import ForgotPassword from './pages/ForgotPassword';
import DashboardPage from './pages/DashboardPage';
import Courses from './pages/Courses';


const theme = createTheme({
  palette: {
    primary: {
      main: '#311188',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" exact element={<RegistrationPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
          </Routes>
        </Layout>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/courses"
            element={
              <DashboardLayout>
                <Courses />
              </DashboardLayout> 
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;