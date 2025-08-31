import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import BaseUrl from '../Api.jsx';

/**
 * ProtectedRoute Component - Optimized Authentication Guard
 * 
 * This component has been optimized to prevent multiple API calls to auth/validate endpoint:
 * 
 * 1. **Global Validation Cache**: Uses a module-level cache to store validation results
 *    - Cache duration: 5 minutes
 *    - Prevents duplicate API calls for the same token
 *    - Handles concurrent validation requests
 * 
 * 2. **Reduced useEffect Dependencies**: Only depends on location.pathname to prevent
 *    unnecessary re-renders and API calls
 * 
 * 3. **Memoized Functions**: Uses useCallback for validateToken and clearUserDataAndRedirect
 *    to prevent function recreation on every render
 * 
 * 4. **Optimized Initial State**: Uses useMemo to compute initial state once
 * 
 * 5. **Cache Clearing**: Provides clearValidationCache() function that can be called
 *    from other components (e.g., on logout)
 * 
 * Usage:
 * - Wrap protected routes with <ProtectedRoute> component
 * - Call clearValidationCache() when logging out
 * - Cache automatically expires after 5 minutes
 */

const PUBLIC_PATHS = ['/', '/login', '/forgotpassword'];
const ADMIN_PATHS = ['/admin-dashboard'];

// Global validation cache to prevent multiple API calls
let validationCache = {
  token: null,
  isValid: false,
  user: null,
  timestamp: 0,
  isPending: false
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Debug counter for API calls
let apiCallCount = 0;
let cacheHitCount = 0;

// Utility function to clear validation cache (can be called from other components)
export const clearValidationCache = () => {
  validationCache = {
    token: null,
    isValid: false,
    user: null,
    timestamp: 0,
    isPending: false
  };
  // Reset debug counters
  apiCallCount = 0;
  cacheHitCount = 0;
  console.log('Validation cache cleared');
};

// Debug function to get cache statistics
export const getValidationCacheStats = () => {
  return {
    apiCalls: apiCallCount,
    cacheHits: cacheHitCount,
    cacheHitRate: apiCallCount > 0 ? (cacheHitCount / apiCallCount * 100).toFixed(2) + '%' : '0%'
  };
};

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectedRef = useRef(false); // Prevent multiple redirects
  
  // Memoize initial state to prevent unnecessary re-renders
  const initialToken = useMemo(() => localStorage.getItem('token'), []);
  const initialUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);
  const hasInitialData = useMemo(() => !!(initialToken && initialUser), [initialToken, initialUser]);
  
  const [loading, setLoading] = useState(!hasInitialData);
  const [isValid, setIsValid] = useState(hasInitialData);
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(initialUser);
  const [hasValidated, setHasValidated] = useState(hasInitialData);

  // Function to clear user data and redirect to login
  const clearUserDataAndRedirect = useCallback((reason = 'Token validation failed') => {
    console.log(`Redirecting to login: ${reason}`);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsValid(false);
    setUser(null);
    setToken(null);
    setHasValidated(false);
    // Clear validation cache
    validationCache = {
      token: null,
      isValid: false,
      user: null,
      timestamp: 0,
      isPending: false
    };
    if (!redirectedRef.current) {
      redirectedRef.current = true;
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Function to validate token with caching
  const validateToken = useCallback(async (currentToken) => {
    // Check if we have a valid cached result
    const now = Date.now();
    if (
      validationCache.token === currentToken &&
      validationCache.timestamp > now - CACHE_DURATION &&
      !validationCache.isPending
    ) {
      cacheHitCount++;
      console.log(`Using cached validation result (Cache hits: ${cacheHitCount})`);
      return {
        valid: validationCache.isValid,
        user: validationCache.user
      };
    }

    // If there's already a pending validation for the same token, wait for it
    if (validationCache.token === currentToken && validationCache.isPending) {
      console.log('Waiting for pending validation');
      // Wait for the pending validation to complete
      while (validationCache.isPending) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return {
        valid: validationCache.isValid,
        user: validationCache.user
      };
    }

    // Set pending state
    validationCache.isPending = true;
    validationCache.token = currentToken;

    try {
      apiCallCount++;
      console.log(`Validating token with server (API call #${apiCallCount})`);
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
          validationCache = {
            token: currentToken,
            isValid: false,
            user: null,
            timestamp: now,
            isPending: false
          };
          return { valid: false, user: null };
        } else {
          // For non-auth server errors, do not clear local data
          console.warn('Non-auth server error during validation:', res.status);
          validationCache = {
            token: currentToken,
            isValid: true,
            user: user,
            timestamp: now,
            isPending: false
          };
          return { valid: true, user: user };
        }
      }

      const data = await res.json();
      const isValid = data.valid && data.user;
      
      // Cache the result
      validationCache = {
        token: currentToken,
        isValid: isValid,
        user: isValid ? data.user : null,
        timestamp: now,
        isPending: false
      };

      return { valid: isValid, user: data.user };
    } catch (err) {
      console.error('Token validation error:', err);
      // Network error or other issues - treat as valid and cache the result
      validationCache = {
        token: currentToken,
        isValid: true,
        user: user,
        timestamp: now,
        isPending: false
      };
      return { valid: true, user: user };
    }
  }, [user]);

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

        // Validate token with server (with caching)
        const validation = await validateToken(currentToken);
        
        if (validation.valid && validation.user) {
          localStorage.setItem('user', JSON.stringify(validation.user));
          setUser(validation.user);
          setHasValidated(true);
          if (validation.user.role === 'admin' && location.pathname !== '/admin-dashboard') {
            redirectedRef.current = true;
            navigate('/admin-dashboard', { replace: true });
            setLoading(false);
            return;
          } else if (validation.user.role === 'support' && location.pathname !== '/support-dashboard') {
            redirectedRef.current = true;
            navigate('/support-dashboard', { replace: true });
            setLoading(false);
            return;
          } else if (validation.user.role !== 'admin' && validation.user.role !== 'support' && location.pathname !== '/dashboard') {
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
      }

      // If token exists and on protected route, validate it (with caching)
      if (currentToken && !PUBLIC_PATHS.includes(location.pathname)) {
        const validation = await validateToken(currentToken);
        
        if (validation.valid && validation.user) {
          localStorage.setItem('user', JSON.stringify(validation.user));
          setUser(validation.user);
          setHasValidated(true);
          // Only allow admin on /admin-dashboard
          if (location.pathname === '/admin-dashboard' && validation.user.role !== 'admin') {
            redirectedRef.current = true;
            navigate('/dashboard', { replace: true });
            setIsValid(false);
            setLoading(false);
            return;
          }
          // Only allow support on /support-dashboard
          if (location.pathname === '/support-dashboard' && validation.user.role !== 'support') {
            redirectedRef.current = true;
            const target = validation.user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
            navigate(target, { replace: true });
            setIsValid(false);
            setLoading(false);
            return;
          }
          // Only allow non-admin/non-support on /dashboard
          if (location.pathname === '/dashboard' && (validation.user.role === 'admin' || validation.user.role === 'support')) {
            redirectedRef.current = true;
            const target = validation.user.role === 'admin' ? '/admin-dashboard' : '/support-dashboard';
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
      } else if (!currentToken && PUBLIC_PATHS.includes(location.pathname)) {
        setIsValid(true);
      }
      setLoading(false);
    };

    checkTokenValidity();
  }, [location.pathname, validateToken, clearUserDataAndRedirect]); // Added validateToken and clearUserDataAndRedirect to dependencies

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