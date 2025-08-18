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

  // Function to clear user data and redirect to login
  const clearUserDataAndRedirect = (reason = 'Token validation failed') => {
    console.log(`Redirecting to login: ${reason}`);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsValid(false);
    setUser(null);
    setToken(null);
    setHasValidated(false);
    if (!redirectedRef.current) {
      redirectedRef.current = true;
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    redirectedRef.current = false; // Reset on pathname change
  }, [location.pathname]);

  useEffect(() => {
    const checkTokenValidity = async () => {
      const currentToken = localStorage.getItem('token');
      setToken(currentToken);

      if (redirectedRef.current) return;

      // If no token and trying to access protected route, redirect to login
      if (!currentToken && !PUBLIC_PATHS.includes(location.pathname)) {
        clearUserDataAndRedirect('No token found');
        setLoading(false);
        return;
      }

      // Always validate with server when token exists to ensure freshness

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

        // Validate token with server (always)
        try {
          const res = await fetch(`${BaseUrl}/auth/validate`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          });
          
          if (!res.ok) {
            // Handle HTTP errors (4xx, 5xx)
            if (res.status === 401 || res.status === 403) {
              clearUserDataAndRedirect('Token expired or invalid');
            } else {
              // For non-auth server errors, do not clear local data.
              console.warn('Non-auth server error during validation:', res.status);
              // If on a public path, still redirect to the best guess dashboard using stored user
              let redirectUser = currentUser;
              if (!redirectUser) {
                try {
                  const storedUser = localStorage.getItem('user');
                  if (storedUser) redirectUser = JSON.parse(storedUser);
                } catch (_) {}
              }
              if (redirectUser) {
                redirectedRef.current = true;
                if (redirectUser.role === 'admin' && location.pathname !== '/admin-dashboard') {
                  navigate('/admin-dashboard', { replace: true });
                } else if (redirectUser.role === 'support' && location.pathname !== '/support-dashboard') {
                  navigate('/support-dashboard', { replace: true });
                } else if (redirectUser.role !== 'admin' && redirectUser.role !== 'support' && location.pathname !== '/dashboard') {
                  navigate('/dashboard', { replace: true });
                }
              }
              setIsValid(true);
            }
            setLoading(false);
            return;
          }

          const data = await res.json();
          if (data.valid && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setHasValidated(true);
            if (data.user.role === 'admin' && location.pathname !== '/admin-dashboard') {
              redirectedRef.current = true;
              navigate('/admin-dashboard', { replace: true });
              setLoading(false);
              return;
            } else if (data.user.role === 'support' && location.pathname !== '/support-dashboard') {
              redirectedRef.current = true;
              navigate('/support-dashboard', { replace: true });
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
            // Token is not valid according to server
            clearUserDataAndRedirect('Token validation failed');
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Token validation error:', err);
          // Network error or other issues - treat as valid and best-effort redirect if on public path
          try {
            let redirectUser = currentUser;
            if (!redirectUser) {
              const storedUser = localStorage.getItem('user');
              if (storedUser) redirectUser = JSON.parse(storedUser);
            }
            if (redirectUser) {
              redirectedRef.current = true;
              if (redirectUser.role === 'admin' && location.pathname !== '/admin-dashboard') {
                navigate('/admin-dashboard', { replace: true });
              } else if (redirectUser.role === 'support' && location.pathname !== '/support-dashboard') {
                navigate('/support-dashboard', { replace: true });
              } else if (redirectUser.role !== 'admin' && redirectUser.role !== 'support' && location.pathname !== '/dashboard') {
                navigate('/dashboard', { replace: true });
              }
            }
          } catch (_) {}
          setIsValid(true);
          setLoading(false);
          return;
        }
      }

      // If token exists and on protected route, validate it (always)
      if (currentToken && !PUBLIC_PATHS.includes(location.pathname)) {
        
        // Validate token with server (always)
        try {
          const res = await fetch(`${BaseUrl}/auth/validate`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`,
            },
          });
          
          if (!res.ok) {
            // Handle HTTP errors (4xx, 5xx)
            if (res.status === 401 || res.status === 403) {
              clearUserDataAndRedirect('Token expired or invalid');
            } else {
              // For non-auth server errors, allow access without clearing
              console.warn('Non-auth server error during validation on protected route:', res.status);
              setIsValid(true);
            }
            setLoading(false);
            return;
          }

          const data = await res.json();
          if (data.valid && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setHasValidated(true);
            // Only allow admin on /admin-dashboard
            if (location.pathname === '/admin-dashboard' && data.user.role !== 'admin') {
              redirectedRef.current = true;
              navigate('/dashboard', { replace: true });
              setIsValid(false);
              setLoading(false);
              return;
            }
            // Only allow support on /support-dashboard
            if (location.pathname === '/support-dashboard' && data.user.role !== 'support') {
              redirectedRef.current = true;
              const target = data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
              navigate(target, { replace: true });
              setIsValid(false);
              setLoading(false);
              return;
            }
            // Only allow non-admin/non-support on /dashboard
            if (location.pathname === '/dashboard' && (data.user.role === 'admin' || data.user.role === 'support')) {
              redirectedRef.current = true;
              const target = data.user.role === 'admin' ? '/admin-dashboard' : '/support-dashboard';
              navigate(target, { replace: true });
              setIsValid(false);
              setLoading(false);
              return;
            }
            setIsValid(true);
          } else {
            // Token is not valid according to server
            clearUserDataAndRedirect('Token validation failed');
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Token validation error:', err);
          // Network error or other issues - allow access without clearing
          setIsValid(true);
          setLoading(false);
          return;
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