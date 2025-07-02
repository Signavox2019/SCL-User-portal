import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout';
import Landing from './pages/RegistrationPage.jsx';
import Login from './pages/Login.jsx';

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
            <Route path="/" exact element={<Landing />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;