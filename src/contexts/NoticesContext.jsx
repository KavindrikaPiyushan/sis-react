import React, { createContext, useContext, useState, useEffect } from 'react';
import noticesService from '../services/admin/noticesService';
import StudentService from '../services/studentService';

const NoticesContext = createContext();

export const useNotices = () => {
  const context = useContext(NoticesContext);
  if (!context) {
    throw new Error('useNotices must be used within a NoticesProvider');
  }
  return context;
};

export const NoticesProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get user data
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem('userData') || '{}');
    } catch {
      return {};
    }
  })();

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      let count = 0;

      if (userData.role === 'admin' || userData.role === 'super_admin' || userData.role === 'student') {
        // Use the same unread count API for all roles
        try {
          const response = await StudentService.getUnreadNoticesCount();
          if (response && response.success) {
            count = response.data?.unreadCount || response.data?.count || response.count || 0;
          } else {
            // Fallback: get notices and count unread locally
            const noticesResponse = await StudentService.getNotices({ page: 1, limit: 100 });
            if (noticesResponse && noticesResponse.success && noticesResponse.data) {
              const notices = noticesResponse.data.notices || [];
              count = notices.filter(notice => !notice.isRead).length;
            }
          }
        } catch (err) {
          console.log('Unread notices count fetch failed:', err);
        }
      }

      setUnreadCount(count);
      console.log(`📊 NoticesContext: Updated unread count for ${userData.role}: ${count}`);
    } catch (error) {
      console.log('Could not fetch unread notices count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Update count manually (called when user reads/unreads a notice)
  const updateUnreadCount = (delta) => {
    setUnreadCount(prev => Math.max(0, prev + delta));
    console.log(`📊 NoticesContext: Manual update - delta: ${delta}, new count: ${Math.max(0, unreadCount + delta)}`);
  };

  // Decrement count when a notice is marked as read
  const markAsRead = () => {
    updateUnreadCount(-1);
  };

  // Increment count when a notice is marked as unread
  const markAsUnread = () => {
    updateUnreadCount(1);
  };

  // Refresh count from server
  const refreshCount = () => {
    fetchUnreadCount();
  };

  // Initial fetch and periodic updates
  useEffect(() => {
    if (userData.role) {
      fetchUnreadCount();
      
      // Refresh count every 60 seconds (less frequent since we have real-time updates)
      const interval = setInterval(fetchUnreadCount, 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [userData.role]);

  const value = {
    unreadCount,
    loading,
    markAsRead,
    markAsUnread,
    refreshCount,
    updateUnreadCount
  };

  return (
    <NoticesContext.Provider value={value}>
      {children}
    </NoticesContext.Provider>
  );
};