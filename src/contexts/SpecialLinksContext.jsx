import React, { createContext, useContext, useState, useEffect } from 'react';
import LinksService from '../services/common/linksService';

const SpecialLinksContext = createContext();

export const useSpecialLinks = () => {
  const context = useContext(SpecialLinksContext);
  if (!context) throw new Error('useSpecialLinks must be used within a SpecialLinksProvider');
  return context;
};



export const SpecialLinksProvider = ({ children }) => {
  const [newLinksCount, setNewLinksCount] = useState(0);
  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem('userData') || '{}');
    } catch {
      return {};
    }
  };
  const [userData, setUserData] = useState(getUserData());
  const userRole = userData.role || 'student';
  const [userVersion, setUserVersion] = useState(0);

  useEffect(() => {
    let mounted = true;
    const LOCAL_VIEWED_KEY = 'viewed_links_v1';
    const getLocallyViewed = () => {
      try { return JSON.parse(localStorage.getItem(LOCAL_VIEWED_KEY) || '[]'); } catch { return []; }
    };
    const isLocallyViewed = (id) => getLocallyViewed().includes(id);
    const NEW_WINDOW_DAYS = 7;

    const isNewForUser = (link) => {
      const created = link.createdAt || link.startDate || link.createdAt;
      const withinWindow = created && ((Date.now() - new Date(created)) <= NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000);
      const serverFlag = !!link.isNew;
      const notViewed = !link.userHasViewed && !isLocallyViewed(link.id);
      return (serverFlag || withinWindow) && notViewed;
    };

    const fetchCount = async () => {
      try {
        const params = { page: 1, limit: 1000 };
        const response = (userRole === 'admin' || userRole === 'super_admin')
          ? await LinksService.getAllLinks(params)
          : await LinksService.getActiveLinks(params);
        if (response && response.success) {
          const data = response.data || [];
          const count = data.filter(isNewForUser).length;
          if (mounted) setNewLinksCount(count);
        }
      } catch (e) {
        // ignore
      }
    };

    fetchCount();
    const t = setInterval(fetchCount, 60 * 1000); // refresh periodically

    // Listen for userData changes in localStorage (other tabs)
    const onStorage = (e) => {
      if (e.key === 'userData') {
        setUserData(getUserData());
        setUserVersion(v => v + 1);
      }
    };
    window.addEventListener('storage', onStorage);

    // Patch localStorage.setItem to detect changes in the same tab
    const origSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      origSetItem.apply(this, arguments);
      if (key === 'userData') {
        setUserData(getUserData());
        setUserVersion(v => v + 1);
      }
    };

    return () => {
      mounted = false;
      clearInterval(t);
      window.removeEventListener('storage', onStorage);
      localStorage.setItem = origSetItem;
    };
  }, [userRole, userVersion]);

  // Called from SpecialLinks page when new count is recalculated
  const updateNewLinksCount = (count) => {
    setNewLinksCount(count);
  };

  return (
    <SpecialLinksContext.Provider value={{ newLinksCount, updateNewLinksCount }}>
      {children}
    </SpecialLinksContext.Provider>
  );
};
