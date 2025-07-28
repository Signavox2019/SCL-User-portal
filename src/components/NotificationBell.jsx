// src/components/NotificationBell.js
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import useNotificationSocket from '../hooks/useNotificationSocket';
import BaseUrl from '../Api';
import 'react-toastify/dist/ReactToastify.css';
import ReactDOM from 'react-dom';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react'; // Added for React.useRef

const NotificationBell = ({ userId, sidebarOpen = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notificationStats, setNotificationStats] = useState({ total: 0, unread: 0 });
  
  // Get user role from localStorage
  const [userRole, setUserRole] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.role || 'intern';
    } catch {
      return 'intern';
    }
  });

  // Update user role when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        setUserRole(user?.role || 'intern');
      } catch {
        setUserRole('intern');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Calculate modal positioning based on sidebar state
  const getModalPosition = () => {
    const sidebarWidth = sidebarOpen ? 220 : 72;
    const navbarHeight = 80;

    return {
      top: navbarHeight,
      left: sidebarWidth,
      right: 0,
      bottom: 0
    };
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token found, skipping notification fetch');
        return;
      }

      console.log('📡 Fetching notifications from API...');
      const response = await fetch(`${BaseUrl}/notifications/my-notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Notifications fetched successfully:', data.length, 'notifications');

      // Transform the data to match our expected format
      const transformedNotifications = data.map(notif => ({
        id: notif._id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        link: notif.link,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
        updatedAt: notif.updatedAt
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch notification stats (total, unread)
  const fetchNotificationStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${BaseUrl}/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setNotificationStats(data);
    } catch (error) {
      console.error('❌ Error fetching notification stats:', error);
      setNotificationStats({ total: 0, unread: 0 });
    }
  }, []);

  // Handle new notification with useCallback to prevent unnecessary re-renders
  const handleNotification = useCallback((notif) => {
    console.log('🔔 [handleNotification] Called with:', notif);
    
    // Handle different notification formats
    let processedNotification = notif;
    
    // If it's an array, take the first item
    if (Array.isArray(notif)) {
      processedNotification = notif[0];
      console.log('📦 [handleNotification] Processing array, taking first item:', processedNotification);
    }
    
    // Validate notification data
    if (!processedNotification || (!processedNotification.title && !processedNotification.message)) {
      console.warn('⚠️ [handleNotification] Notification missing title or message:', processedNotification);
      return;
    }
    
    // Ensure notification has an id and proper structure
    const notificationWithTimestamp = {
      ...processedNotification,
      createdAt: processedNotification.createdAt || new Date().toISOString(),
      id: processedNotification.id || processedNotification._id || `notif-${Date.now()}-${Math.random()}`,
      isRead: processedNotification.isRead || false,
      type: processedNotification.type || 'notification'
    };
    
    setNotifications((prev) => {
      // Check if notification already exists to prevent duplicates
      const exists = prev.some(n => n.id === notificationWithTimestamp.id);
      if (exists) {
        console.log('⚠️ [handleNotification] Notification already exists, skipping...');
        return prev;
      }
      console.log('✅ [handleNotification] Adding new notification to state:', notificationWithTimestamp);
      return [notificationWithTimestamp, ...prev];
    });
    
    // Show enhanced toast notification immediately for real-time notifications
    console.log('📢 [handleNotification] Showing enhanced toast for:', notificationWithTimestamp.title, notificationWithTimestamp.message);
    
    // Debug toast configuration
    console.log('🔧 [handleNotification] Toast configuration:', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      toastId: `notification-${notificationWithTimestamp.id}`
    });
    
    // Ultra-compact professional toast design
    toast.info(
      <div 
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '12px',
          cursor: 'pointer',
          position: 'relative',
          width: '100%',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
        }}
        onClick={() => {
          console.log('📢 [handleNotification] Toast clicked, opening modal for:', notificationWithTimestamp);
          setSelectedNotification(notificationWithTimestamp);
          setShowModal(true);
          // Mark as read if not already read
          if (!notificationWithTimestamp.isRead) {
            markAsRead(notificationWithTimestamp.id);
          }
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.12)';
          e.target.style.borderColor = '#cbd5e1';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
          e.target.style.borderColor = '#e2e8f0';
        }}
      >
        {/* Status indicator */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: !notificationWithTimestamp.isRead ? '#2563eb' : '#94a3b8',
          borderRadius: '6px 0 0 6px'
        }} />

        {/* Compact icon */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '4px',
          background: 'transparent', // No background color
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: !notificationWithTimestamp.isRead ? '#2563eb' : '#64748b', // Bell color
          fontSize: '18px', // Slightly larger for clarity
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}>
          <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>🔔</span>
        </div>

        {/* Content area */}
        <div style={{ 
          flex: 1, 
          minWidth: 0
        }}>
          {/* Header with title and time */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '4px',
            gap: '8px'
          }}>
            <h4 style={{
              fontWeight: '600',
              fontSize: '13px',
              color: '#1e293b',
              margin: 0,
              lineHeight: '1.3',
              wordBreak: 'break-word',
              flex: 1
            }}>
              {notificationWithTimestamp.title}
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0
            }}>
              {!notificationWithTimestamp.isRead && (
                <span style={{
                  fontSize: '9px',
                  color: '#ffffff',
                  fontWeight: '600',
                  background: '#dc2626',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  New
                </span>
              )}
              <span style={{
                fontSize: '10px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                {new Date(notificationWithTimestamp.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>

          {/* Compact message */}
          <p style={{
            fontSize: '12px',
            color: '#475569',
            lineHeight: '1.4',
            margin: '0 0 6px 0',
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {notificationWithTimestamp.message}
          </p>

          {/* Compact footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <span style={{
              fontSize: '10px',
              color: '#64748b',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {notificationWithTimestamp.type || 'Notification'}
            </span>
            
            <span style={{
              fontSize: '10px',
              color: '#2563eb',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              View →
            </span>
          </div>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        toastId: `notification-${notificationWithTimestamp.id}`,
        style: {
          background: 'transparent',
          border: 'none',
          borderRadius: '6px',
          boxShadow: 'none',
          padding: '0',
          minWidth: '280px',
          maxWidth: '360px',
          cursor: 'pointer',
          position: 'relative'
        },
        onOpen: () => console.log('📢 [handleNotification] Compact toast opened'),
        onClose: () => console.log('📢 [handleNotification] Compact toast closed'),
      }
    );
    
    // Refetch stats and notifications to update UI in real time
    fetchNotificationStats();
    fetchNotifications();
  }, [fetchNotificationStats, fetchNotifications]);

  // Use the socket hook
  const socket = useNotificationSocket(userId, handleNotification);

  // Monitor socket status
  useEffect(() => {
    if (socket) {
      const handleConnect = () => {
        console.log('✅ Socket connected');
        setSocketStatus('connected');
      };
      const handleDisconnect = () => {
        console.log('🔌 Socket disconnected');
        setSocketStatus('disconnected');
      };
      const handleError = (error) => {
        console.error('❌ Socket error:', error);
        setSocketStatus('error');
      };

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleError);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleError);
      };
    }
  }, [socket]);

  // Fetch notifications when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchNotificationStats();
    }
  }, [userId, fetchNotifications, fetchNotificationStats]);

  // Debug socket status
  useEffect(() => {
    console.log('🔌 Socket status:', socketStatus);
  }, [socketStatus]);

  // Clear notifications when dropdown is closed
  const handleDropdownToggle = () => {
    setShowDropdown((prev) => !prev);
    // Fetch fresh notifications when opening dropdown
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${BaseUrl}/notifications/mark-read/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        await fetchNotificationStats();
        console.log('✅ Notification marked as read');
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  // Handle view notification
  const handleViewNotification = async (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);

    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  // Close dropdown when clicking outside (but not when clicking on modal)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const notificationBell = document.querySelector('[data-notification-bell]');
      const notificationModal = document.querySelector('[data-notification-modal]');
      const batchModal = document.querySelector('[data-batch-modal]');
      
      // Don't close if clicking on notification modal or batch modal
      if (notificationModal && notificationModal.contains(event.target)) {
        return;
      }
      
      if (batchModal && batchModal.contains(event.target)) {
        return;
      }
      
      // Close dropdown if clicking outside notification bell
      if (notificationBell && !notificationBell.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Test notification function
  const testNotification = () => {
    const testNotif = {
      title: 'Test Notification',
      message: 'This is a test notification to verify socket connection',
      createdAt: new Date().toISOString(),
      id: Date.now()
    };
    console.log('🧪 [testNotification] Testing with:', testNotif);
    handleNotification(testNotif);
    
    // Also test direct toast to ensure it's working
    toast.success('🧪 Direct toast test - if you see this, toast is working!', {
      position: "top-right",
      autoClose: 3000
    });
  };

  
  // Test socket connection manually
  const testSocketConnection = () => {
    if (socket) {
      console.log('🧪 Testing socket connection...');
      console.log('🔗 Socket state:', socket.connected ? 'Connected' : 'Disconnected');
      console.log('🔗 Socket ID:', socket.id);
      console.log('🔗 Socket URL:', socket.io?.uri);

      if (socket.connected) {
        // Test emit
        socket.emit('test', { message: 'Test from client' });
        console.log('✅ Test message sent to server');
      } else {
        console.log('❌ Socket not connected, attempting to connect...');
        socket.connect();
      }
    } else {
      console.log('❌ No socket instance available');
    }
  };

  // Batch Notification Modal State
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchForm, setBatchForm] = useState({
    title: '',
    message: '',
    type: '',
    link: '',
    batchIds: []
  });
  const [batchFormLoading, setBatchFormLoading] = useState(false);
  const [batchFormError, setBatchFormError] = useState('');
  const [batches, setBatches] = useState([]);
  const notificationTypeOptions = [
    { value: 'registration', label: 'Registration' },
    { value: 'course', label: 'Course' },
    { value: 'event', label: 'Event' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'system', label: 'System' },
  ];

  // Fetch batches when modal opens
  useEffect(() => {
    if (batchModalOpen) {
      setBatchFormError('');
      setBatchFormLoading(true);
      axios.get(`${BaseUrl}/batches/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => {
          setBatches(res.data.batches || []);
        })
        .catch(err => {
          setBatchFormError('Failed to fetch batches');
        })
        .finally(() => setBatchFormLoading(false));
    }
  }, [batchModalOpen]);

  // Handle batch form input
  const handleBatchFormChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (name === 'batchIds') {
      setBatchForm(f => ({ ...f, batchIds: Array.from(selectedOptions).map(opt => opt.value) }));
    } else {
      setBatchForm(f => ({ ...f, [name]: value }));
    }
  };

  // Submit batch notification
  const handleBatchFormSubmit = async (e) => {
    e.preventDefault();
    setBatchFormLoading(true);
    setBatchFormError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${BaseUrl}/notifications/batch`,
        batchForm,
        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
      );
      toast.success(res.data.message || 'Batch notification sent!', { position: 'top-right', autoClose: 4000 });
      setBatchModalOpen(false);
      setBatchForm({ title: '', message: '', type: '', link: '', batchIds: [] });
    } catch (err) {
      setBatchFormError(err.response?.data?.message || err.message || 'Failed to send notification');
    } finally {
      setBatchFormLoading(false);
    }
  };

  // Get unread count (from stats)
  const unreadCount = notificationStats.unread;

  // Add state for custom batch dropdown
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);
  const batchDropdownRef = React.useRef();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (batchDropdownRef.current && !batchDropdownRef.current.contains(event.target)) {
        setBatchDropdownOpen(false);
      }
    }
    if (batchDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [batchDropdownOpen]);

  // Handle batch checkbox change
  const handleBatchCheckboxChange = (batchId) => {
    setBatchForm(f => {
      const exists = f.batchIds.includes(batchId);
      return {
        ...f,
        batchIds: exists ? f.batchIds.filter(id => id !== batchId) : [...f.batchIds, batchId]
      };
    });
  };

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }} data-notification-bell>
        {/* Enhanced Bell icon with count and status indicator */}
        <div
          onClick={handleDropdownToggle}
          style={{
            cursor: 'pointer',
            position: 'relative',
            padding: '8px',
            borderRadius: '50%',
            background: socketStatus === 'connected' 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)' 
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: `2px solid ${socketStatus === 'connected' ? '#22c55e' : '#ef4444'}`,
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }}
          title={`Socket: ${socketStatus}`}
        >
          <div style={{
            fontSize: '16px',
            filter: socketStatus === 'connected' ? 'drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3))' : 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))'
          }}>
            🔔
          </div>
          
          {unreadCount > 0 && (
            <span
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                borderRadius: '50%',
                padding: '3px 6px',
                fontSize: '10px',
                position: 'absolute',
                top: -6,
                right: -6,
                minWidth: '16px',
                textAlign: 'center',
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(239, 68, 68, 0.4)',
                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          
          {/* Enhanced Socket status indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: socketStatus === 'connected' 
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              animation: socketStatus === 'connected' ? 'pulse 2s infinite' : 'none'
            }}
          />
        </div>

        {/* Enhanced Dropdown list */}
        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              width: '380px',
              maxHeight: '500px',
              overflowY: 'auto',
              overflowX: 'hidden',
              zIndex: 1000,
              borderRadius: '16px',
              backdropFilter: 'blur(20px)',
              animation: 'slideInDown 0.3s ease-out'
            }}
          >
            {/* Enhanced Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '16px 16px 0 0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative background elements */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }} />
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    🔔
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '18px', 
                      fontWeight: '600',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      Notifications
                    </h3>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: '12px', 
                      opacity: 0.9 
                    }}>
                      {unreadCount} unread • {notificationStats.total} total
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: socketStatus === 'connected' ? '#22c55e' : '#ef4444',
                    animation: socketStatus === 'connected' ? 'pulse 2s infinite' : 'none',
                    boxShadow: socketStatus === 'connected' ? '0 0 8px rgba(34, 197, 94, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)'
                  }} />
                  <span style={{ 
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    letterSpacing: '0.5px'
                  }}>
                    {socketStatus === 'connected' ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Creative Test Panel */}
            <div style={{
              padding: '20px 28px',
              borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative background */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.02) 0%, rgba(236, 72, 153, 0.02) 100%)',
                opacity: 0.6
              }} />
              
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '16px',
                position: 'relative',
                zIndex: 1,
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={testNotification}
                  style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 8px 20px rgba(30, 64, 175, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.3)';
                  }}
                >
                  🧪 Test Notification
                </button>
                <button
                  onClick={testSocketConnection}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)';
                    e.target.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
                  }}
                >
                  🔗 Test Socket
                </button>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setBatchModalOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #be185d 0%, #7c3aed 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(190, 24, 93, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px) scale(1.02)';
                      e.target.style.boxShadow = '0 8px 20px rgba(190, 24, 93, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(190, 24, 93, 0.3)';
                    }}
                  >
                    📢 Batch Notification
                  </button>
                )}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#64748b',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                position: 'relative',
                zIndex: 1,
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(139, 92, 246, 0.1)'
              }}>
                <div style={{ fontWeight: '500' }}>Socket: {socketStatus}</div>
                <div style={{ fontWeight: '500' }}>User ID: {userId || 'Not set'}</div>
                <div style={{ fontWeight: '500' }}>Notifications: {notifications.length}</div>
                <div style={{ fontWeight: '500' }}>Unread: {unreadCount}</div>
              </div>
            </div>

            {/* Enhanced Notifications list */}
            {loading ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#64748b',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ margin: 0, fontWeight: '500' }}>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#64748b',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  opacity: 0.5
                }}>
                  🔔
                </div>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600', fontSize: '16px' }}>
                  No notifications
                </p>
                <small style={{ color: '#94a3b8' }}>
                  {socketStatus === 'connected' ? 'Waiting for new notifications...' : 'Socket disconnected'}
                </small>
              </div>
            ) : (
              <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                {notifications.map((n, index) => (
                  <div
                    key={n.id || index}
                    style={{
                      padding: '20px 24px',
                      borderBottom: '1px solid #f1f5f9',
                      background: n.isRead 
                        ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
                        : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: n.isRead ? 0.85 : 1,
                      borderLeft: n.isRead ? '4px solid transparent' : '4px solid #3b82f6',
                      position: 'relative',
                      overflow: 'hidden',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      borderRadius: '0',
                      margin: '0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
                    }}
                    onClick={() => handleViewNotification(n)}
                    onMouseEnter={(e) => {
                      // Enhanced hover effect for entire notification
                      const target = e.currentTarget;
                      target.style.transform = 'translateX(8px) scale(1.02)';
                      target.style.background = n.isRead 
                        ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' 
                        : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                      target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)';
                      target.style.borderLeft = n.isRead ? '4px solid #94a3b8' : '4px solid #1d4ed8';
                      
                      // Add subtle glow effect
                      target.style.filter = 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.2))';
                    }}
                    onMouseLeave={(e) => {
                      // Reset hover effects
                      const target = e.currentTarget;
                      target.style.transform = 'translateX(0) scale(1)';
                      target.style.background = n.isRead 
                        ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
                        : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
                      target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                      target.style.borderLeft = n.isRead ? '4px solid transparent' : '4px solid #3b82f6';
                      target.style.filter = 'none';
                    }}
                  >
                    {/* Enhanced Unread indicator with animation */}
                    {!n.isRead && (
                      <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        animation: 'pulse 2s infinite',
                        boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
                        zIndex: 2
                      }} />
                    )}
                    
                    {/* Notification Icon */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '24px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: n.isRead 
                        ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)' 
                        : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: n.isRead ? '#64748b' : '#3b82f6',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      zIndex: 1
                    }}>
                      🔔
                    </div>
                    
                    {/* Main Content with proper spacing for icon */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      marginLeft: '48px',
                      minHeight: '60px',
                      justifyContent: 'space-between'
                    }}>
                      {/* Header Section */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                        gap: '12px'
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                            flexWrap: 'wrap'
                          }}>
                            <strong style={{
                              color: n.isRead ? '#64748b' : '#1e293b',
                              fontSize: '15px',
                              fontWeight: n.isRead ? '500' : '600',
                              lineHeight: '1.4',
                              wordBreak: 'break-word',
                              transition: 'color 0.3s ease'
                            }}>
                              {n.title}
                            </strong>
                            {!n.isRead && (
                              <span style={{
                                padding: '3px 8px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                              }}>
                              NEW
                            </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Message Section */}
                      <p style={{
                        margin: '0 0 12px 0',
                        color: n.isRead ? '#64748b' : '#374151',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        transition: 'color 0.3s ease'
                      }}>
                        {n.message}
                      </p>
                      
                      {/* Footer Section */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <small style={{
                          color: n.isRead ? '#94a3b8' : '#64748b',
                          fontSize: '11px',
                          fontWeight: '500',
                          transition: 'color 0.3s ease'
                        }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </small>
                        <span style={{
                          color: n.isRead ? '#94a3b8' : '#3b82f6',
                          fontSize: '11px',
                          fontWeight: n.isRead ? '400' : '600',
                          transition: 'color 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {n.isRead ? '✓ Viewed' : 'Click to view →'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Hover overlay for enhanced effect */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 51, 234, 0.02) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                      borderRadius: 'inherit'
                    }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Notification Details Modal */}
      {showModal && selectedNotification &&
        ReactDOM.createPortal(
          <div
            data-notification-modal
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(4px)',
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                padding: '0',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                animation: 'modalSlideIn 0.3s ease-out',
                zIndex: 10000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '24px 24px 20px 24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative elements */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)'
                }} />

                {/* Close button */}
                <button
                  onClick={handleCloseModal}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  ×
                </button>

                {/* Title and type */}
                <div style={{ position: 'relative', zIndex: 5 }}>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '12px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {selectedNotification.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '6px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      borderRadius: '25px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      {selectedNotification.type || 'Notification'}
                    </span>
                    <span style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {new Date(selectedNotification.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div style={{
                background: 'white',
                padding: '24px',
                maxHeight: '60vh',
                overflowY: 'auto'
              }}>
                {/* Message content */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    lineHeight: '1.7',
                    color: '#334155',
                    fontSize: '16px',
                    whiteSpace: 'pre-wrap',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    {selectedNotification.message}
                  </div>
                </div>

                {/* Status indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: selectedNotification.isRead ? '#f0fdf4' : '#fef3c7',
                  borderRadius: '12px',
                  border: `1px solid ${selectedNotification.isRead ? '#bbf7d0' : '#fde68a'}`,
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: selectedNotification.isRead ? '#22c55e' : '#f59e0b'
                    }} />
                    <span style={{
                      color: selectedNotification.isRead ? '#166534' : '#92400e',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {selectedNotification.isRead ? '✓ Read' : '● New'}
                    </span>
                  </div>
                  <span style={{
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {selectedNotification.isRead ? 'Viewed' : 'Unread'}
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {selectedNotification.link && (
                    <a
                      href={selectedNotification.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        display: 'inline-block',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      🔗 Open Link
                    </a>
                  )}
                  <button
                    onClick={handleCloseModal}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e2e8f0';
                      e.target.style.color = '#475569';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.color = '#64748b';
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Enhanced Modal animation styles */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Batch Notification Modal */}
      {batchModalOpen && ReactDOM.createPortal(
        <div data-batch-modal className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 animate-fadeIn">
          <div className="relative w-full max-w-2xl mx-auto min-w-[320px] bg-gradient-to-br from-[#312e81]/90 to-[#0a081e]/95 rounded-3xl shadow-2xl border border-pink-400/30 flex flex-col max-h-[90vh] overflow-hidden animate-modalPop">
            {/* Accent Header Bar */}
            <div className="h-3 w-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-t-3xl mb-2" />
            {/* Close Button */}
            <button className="absolute top-5 right-5 text-purple-200 hover:text-pink-400 transition-colors z-10 bg-white/10 rounded-full p-1.5 shadow-lg backdrop-blur-md" onClick={() => setBatchModalOpen(false)}>
              <CloseIcon fontSize="large" />
            </button>
            <form className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar" onSubmit={handleBatchFormSubmit}>
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-glow">Send Batch Notification</h2>
              {batchFormError && <div className="text-red-400 font-bold mb-2">{batchFormError}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-purple-200 mb-1 font-semibold">Title</label>
                  <input type="text" name="title" value={batchForm.title} onChange={handleBatchFormChange} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div>
                  <label className="block text-purple-200 mb-1 font-semibold">Type</label>
                  <select name="type" value={batchForm.type} onChange={handleBatchFormChange} required className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
                    <option value="">Select</option>
                    {notificationTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-purple-200 mb-1 font-semibold">Message</label>
                  <textarea name="message" value={batchForm.message} onChange={handleBatchFormChange} required rows={2} className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-purple-200 mb-1 font-semibold">Link (optional)</label>
                  <input type="text" name="link" value={batchForm.link} onChange={handleBatchFormChange} placeholder="/dashboard/quizzes/module-2" className="w-full py-2 px-3 rounded-lg bg-purple-900/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-pink-400/40" />
                </div>
                {/* Enhanced Creative Batch Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-purple-200 mb-1 font-semibold flex items-center gap-2">
                    <span>🎯 Target Batches</span>
                    {batchForm.batchIds.length > 0 && (
                      <span className="text-xs bg-pink-500/20 text-pink-200 px-2 py-1 rounded-full">
                        {batchForm.batchIds.length} selected
                      </span>
                    )}
                  </label>
                  <div className="relative" ref={batchDropdownRef}>
                    {/* Enhanced Trigger Button */}
                    <div
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400/40 cursor-pointer flex items-center justify-between backdrop-blur-sm transition-all duration-300 hover:from-purple-900/80 hover:to-pink-900/80"
                      onClick={() => setBatchDropdownOpen(open => !open)}
                      style={{ 
                        minHeight: '48px',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)',
                        background: batchForm.batchIds.length > 0 
                          ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)'
                          : 'linear-gradient(135deg, rgba(88, 28, 135, 0.6) 0%, rgba(157, 23, 77, 0.6) 100%)'
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* Icon */}
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-lg">🎓</span>
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">
                            {batchForm.batchIds.length === 0
                              ? 'Select target batches...'
                              : `${batchForm.batchIds.length} batch${batchForm.batchIds.length > 1 ? 'es' : ''} selected`
                            }
                          </div>
                          {batchForm.batchIds.length > 0 && (
                            <div className="text-xs text-purple-200 truncate">
                              {batches
                                .filter(b => batchForm.batchIds.includes(b._id))
                                .map(b => b.batchName)
                                .join(', ')
                              }
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Animated Arrow */}
                      <div className={`transition-transform duration-300 ${batchDropdownOpen ? 'rotate-180' : ''}`}>
                        <svg width="20" height="20" fill="currentColor" className="text-purple-200" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Enhanced Dropdown Menu */}
                    {batchDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-3 bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-2xl z-50 max-h-80 overflow-hidden border border-purple-200/50 backdrop-blur-xl animate-fadeIn">
                        {/* Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-b border-purple-200/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🎓</span>
                              <span className="font-semibold">Available Batches</span>
                            </div>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                              {batches.length} total
                            </span>
                          </div>
                        </div>
                        
                        {/* Search/Filter (if needed in future) */}
                        {/* <div className="px-4 py-2 border-b border-gray-100">
                          <input 
                            type="text" 
                            placeholder="Search batches..." 
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div> */}
                        
                        {/* Batch List */}
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          {batches.length === 0 ? (
                            <div className="p-6 text-center">
                              <div className="text-4xl mb-2">📚</div>
                              <div className="text-gray-500 font-medium">No batches available</div>
                              <div className="text-gray-400 text-sm">Create batches first to send notifications</div>
                            </div>
                          ) : (
                            <div className="p-2">
                              {batches.map((batch, index) => (
                                <label 
                                  key={batch._id} 
                                  className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 group ${
                                    batchForm.batchIds.includes(batch._id) 
                                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200' 
                                      : 'hover:border hover:border-purple-200/50'
                                  }`}
                                  style={{ marginBottom: index < batches.length - 1 ? '4px' : '0' }}
                                >
                                  {/* Custom Checkbox */}
                                  <div className="relative mr-3">
                                    <input
                                      type="checkbox"
                                      checked={batchForm.batchIds.includes(batch._id)}
                                      onChange={() => handleBatchCheckboxChange(batch._id)}
                                      className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                      batchForm.batchIds.includes(batch._id)
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500'
                                        : 'border-gray-300 group-hover:border-purple-400'
                                    }`}>
                                      {batchForm.batchIds.includes(batch._id) && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Batch Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                      {batch.batchName}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Batch ID: {batch._id.slice(-8)}...
                                    </div>
                                  </div>
                                  
                                  {/* Selection Indicator */}
                                  {batchForm.batchIds.includes(batch._id) && (
                                    <div className="ml-2">
                                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                                    </div>
                                  )}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Footer */}
                        {batchForm.batchIds.length > 0 && (
                          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-200/20">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-purple-700 font-medium">
                                {batchForm.batchIds.length} batch{batchForm.batchIds.length > 1 ? 'es' : ''} selected
                              </span>
                              <button
                                type="button"
                                onClick={() => setBatchForm(f => ({ ...f, batchIds: [] }))}
                                className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                              >
                                Clear all
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="px-5 py-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300" onClick={() => setBatchModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={batchFormLoading} className="px-7 py-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                  {batchFormLoading ? (
                    <CircularProgress size={22} color="inherit" thickness={5} style={{ color: '#fff' }} />
                  ) : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
            }
            @keyframes modalPop {
              0% { transform: scale(0.95) translateY(40px); opacity: 0; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            .animate-modalPop {
              animation: modalPop 0.4s cubic-bezier(0.4,0,0.2,1);
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, #a78bfa55 0%, #ec489955 100%);
              border-radius: 8px;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(139, 92, 246, 0.1);
              border-radius: 8px;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .animate-pulse {
              animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes shimmer {
              0% { background-position: -200px 0; }
              100% { background-position: calc(200px + 100%) 0; }
            }
            .shimmer {
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
              background-size: 200px 100%;
              animation: shimmer 2s infinite;
            }
          `}</style>
        </div>,
        document.getElementById('modal-root')
      )}
    </>
  );
};

export default NotificationBell;
