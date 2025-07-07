import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import BaseUrl from '../Api.jsx';

const PUBLIC_PATHS = ['/', '/login', '/forgotpassword'];

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [location.pathname]);

  useEffect(() => {
    const validateToken = async () => {
      // If on a public path and has token, redirect to dashboard
      if (PUBLIC_PATHS.includes(location.pathname) && token) {
        navigate('/dashboard', { replace: true });
        setLoading(false);
        return;
      }

      // If no token and trying to access protected route, redirect to login
      if (!token && !PUBLIC_PATHS.includes(location.pathname)) {
        navigate('/login', { replace: true });
        setLoading(false);
        return;
      }

      // If token exists, validate it
      if (token) {
        try {
          const res = await fetch(`${BaseUrl}/auth/validate`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await res.json();
          
          if (res.ok && data.valid) {
            setIsValid(true);
            // Store user details in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            // Token is invalid, remove it and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsValid(false);
            if (!PUBLIC_PATHS.includes(location.pathname)) {
              navigate('/login', { replace: true });
            }
          }
        } catch (err) {
          console.error('Token validation error:', err);
          setIsValid(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (!PUBLIC_PATHS.includes(location.pathname)) {
            navigate('/login', { replace: true });
          }
        }
      } else {
        // No token, but on public path - allow access
        setIsValid(true);
      }
      
      setLoading(false);
    };

    setLoading(true);
    validateToken();
  }, [location.pathname, token, navigate]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white/80">
        <CircularProgress size={48} color="primary" />
      </div>
    );
  }

  // For public routes, don't render children (let App.jsx handle them)
  if (PUBLIC_PATHS.includes(location.pathname)) {
    return null;
  }

  // For protected routes, render children if token is valid
  return isValid ? children : null;
};

export default ProtectedRoute; 