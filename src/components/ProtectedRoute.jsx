import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import BaseUrl from '../Api.jsx';

const PUBLIC_PATHS = ['/', '/login', '/forgotpassword'];
const ADMIN_PATHS = ['/admin-dashboard'];

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    const checkTokenValidity = async () => {
      const currentToken = localStorage.getItem('token');
      setToken(currentToken);

      // If on a public path and has valid token, redirect to dashboard or admin-dashboard
      if (PUBLIC_PATHS.includes(location.pathname) && currentToken) {
        if (hasValidated && user) {
          // Use cached user data if already validated
          if (user.role === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
          setLoading(false);
          return;
        }
        
        try {
          const res = await fetch(`${BaseUrl}/auth/validate`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          });
          const data = await res.json();
          if (res.ok && data.valid) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setHasValidated(true);
            // Redirect based on role
            if (data.user.role === 'admin') {
              navigate('/admin-dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
            setLoading(false);
            return;
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsValid(false);
            setLoading(false);
            return;
          }
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsValid(false);
          setLoading(false);
          return;
        }
      }

      // If no token and trying to access protected route, redirect to login
      if (!currentToken && !PUBLIC_PATHS.includes(location.pathname)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        setLoading(false);
        return;
      }

      // If token exists and on protected route, validate it
      if (currentToken && !PUBLIC_PATHS.includes(location.pathname)) {
        // If we have already validated and user data, use cached data for role checks
        if (hasValidated && user) {
          // If trying to access /admin-dashboard and not admin, redirect
          if (ADMIN_PATHS.includes(location.pathname) && user.role !== 'admin') {
            navigate('/dashboard', { replace: true });
            setIsValid(false);
            setLoading(false);
            return;
          }
          // If admin, and not on /admin-dashboard, redirect to /admin-dashboard
          if (user.role === 'admin' && location.pathname === '/dashboard') {
            navigate('/admin-dashboard', { replace: true });
            setIsValid(false);
            setLoading(false);
            return;
          }
          // If not admin and trying to access /admin-dashboard, redirect
          if (location.pathname === '/admin-dashboard' && user.role !== 'admin') {
            navigate('/dashboard', { replace: true });
            setIsValid(false);
            setLoading(false);
            return;
          }
          setIsValid(true);
          setLoading(false);
          return;
        }
        
        try {
          const res = await fetch(`${BaseUrl}/auth/validate`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          });
          const data = await res.json();
          if (res.ok && data.valid) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setHasValidated(true);
            // If trying to access /admin-dashboard and not admin, redirect
            if (ADMIN_PATHS.includes(location.pathname) && data.user.role !== 'admin') {
              navigate('/dashboard', { replace: true });
              setIsValid(false);
              setLoading(false);
              return;
            }
            // If admin, and not on /admin-dashboard, redirect to /admin-dashboard
            if (data.user.role === 'admin' && location.pathname === '/dashboard') {
              navigate('/admin-dashboard', { replace: true });
              setIsValid(false);
              setLoading(false);
              return;
            }
            // If not admin and trying to access /admin-dashboard, redirect
            if (location.pathname === '/admin-dashboard' && data.user.role !== 'admin') {
              navigate('/dashboard', { replace: true });
              setIsValid(false);
              setLoading(false);
              return;
            }
            setIsValid(true);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsValid(false);
            navigate('/login', { replace: true });
          }
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsValid(false);
          navigate('/login', { replace: true });
        }
      } else if (!currentToken && PUBLIC_PATHS.includes(location.pathname)) {
        setIsValid(true);
      }
      setLoading(false);
    };
    
    // Only show loading on initial load, not on navigation between protected routes
    if (hasValidated && isValid) {
      // If we're already validated and just navigating between protected routes, don't show loading
      setLoading(false);
    } else if (!hasValidated) {
      // Only set loading to true if we haven't validated yet
      setLoading(true);
    }
    
    checkTokenValidity();
  }, [location.pathname, navigate, hasValidated, user]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white/80">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (PUBLIC_PATHS.includes(location.pathname)) {
    return null;
  }

  return isValid ? children : null;
};

export default ProtectedRoute; 