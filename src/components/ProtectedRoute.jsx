import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import BaseUrl from '../Api.jsx';

const PUBLIC_PATHS = ['/', '/login', '/forgotpassword'];
const ADMIN_PATHS = ['/admin-dashboard'];

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectedRef = useRef(false); // Prevent multiple redirects
  const [loading, setLoading] = useState(() => {
    // If we have both token and user data, don't show loading initially
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !(token && user);
  });
  const [isValid, setIsValid] = useState(() => {
    // If we have both token and user data, consider it valid immediately
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [hasValidated, setHasValidated] = useState(() => {
    // If we have both token and user data, consider it already validated
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  });

  useEffect(() => {
    redirectedRef.current = false; // Reset on pathname change
  }, [location.pathname]);

  useEffect(() => {
    const checkTokenValidity = async () => {
      const currentToken = localStorage.getItem('token');
      setToken(currentToken);

      if (redirectedRef.current) return;

      // If we already have valid data and are on a protected route, just set loading to false
      if (hasValidated && user && !PUBLIC_PATHS.includes(location.pathname)) {
        setLoading(false);
        return;
      }

      // If on a public path and has valid token, redirect to correct dashboard
      if (PUBLIC_PATHS.includes(location.pathname) && currentToken) {
        // First check if we have user data in localStorage
        let currentUser = user;
        if (!currentUser) {
          try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              currentUser = JSON.parse(storedUser);
              setUser(currentUser);
            }
          } catch (err) {
            console.error('Error parsing stored user:', err);
          }
        }

        if (hasValidated && currentUser) {
          if ((currentUser.role === 'admin' || currentUser.role === 'support') && location.pathname !== '/admin-dashboard') {
            redirectedRef.current = true;
            navigate('/admin-dashboard', { replace: true });
            setLoading(false);
            return;
          } else if (currentUser.role !== 'admin' && currentUser.role !== 'support' && location.pathname !== '/dashboard') {
            redirectedRef.current = true;
            navigate('/dashboard', { replace: true });
            setLoading(false);
            return;
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
            if ((data.user.role === 'admin' || data.user.role === 'support') && location.pathname !== '/admin-dashboard') {
              redirectedRef.current = true;
              navigate('/admin-dashboard', { replace: true });
              setLoading(false);
              return;
            } else if (data.user.role !== 'admin' && data.user.role !== 'support' && location.pathname !== '/dashboard') {
              redirectedRef.current = true;
              navigate('/dashboard', { replace: true });
              setLoading(false);
              return;
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
        redirectedRef.current = true;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        setLoading(false);
        return;
      }

      // If token exists and on protected route, validate it
      if (currentToken && !PUBLIC_PATHS.includes(location.pathname)) {
        // First check if we have user data in localStorage
        let currentUser = user;
        if (!currentUser) {
          try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              currentUser = JSON.parse(storedUser);
              setUser(currentUser);
            }
          } catch (err) {
            console.error('Error parsing stored user:', err);
          }
        }

        if (hasValidated && currentUser) {
          // Only allow admin/support on /admin-dashboard
          if (location.pathname === '/admin-dashboard' && currentUser.role !== 'admin' && currentUser.role !== 'support') {
            redirectedRef.current = true;
            navigate('/dashboard', { replace: true });
            setIsValid(false);
            setLoading(false);
            return;
          }
          // Only allow non-admin/support on /dashboard
          if (location.pathname === '/dashboard' && (currentUser.role === 'admin' || currentUser.role === 'support')) {
            redirectedRef.current = true;
            navigate('/admin-dashboard', { replace: true });
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
            // Only allow admin/support on /admin-dashboard
            if (location.pathname === '/admin-dashboard' && data.user.role !== 'admin' && data.user.role !== 'support') {
              redirectedRef.current = true;
              navigate('/dashboard', { replace: true });
              setIsValid(false);
              setLoading(false);
              return;
            }
            // Only allow non-admin/support on /dashboard
            if (location.pathname === '/dashboard' && (data.user.role === 'admin' || data.user.role === 'support')) {
              redirectedRef.current = true;
              navigate('/admin-dashboard', { replace: true });
              setIsValid(false);
              setLoading(false);
              return;
            }
            setIsValid(true);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsValid(false);
            redirectedRef.current = true;
            navigate('/login', { replace: true });
          }
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsValid(false);
          redirectedRef.current = true;
          navigate('/login', { replace: true });
        }
      } else if (!currentToken && PUBLIC_PATHS.includes(location.pathname)) {
        setIsValid(true);
      }
      setLoading(false);
    };

    checkTokenValidity();
  }, [location.pathname, hasValidated, user, navigate]);

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