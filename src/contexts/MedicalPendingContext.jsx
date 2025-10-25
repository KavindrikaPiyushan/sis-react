import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import MedicalReportsService from '../services/medicalReportsService';
import { useAuth } from '../services/AuthContext';

const MedicalPendingContext = createContext();

export function MedicalPendingProvider({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPending = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const res = await MedicalReportsService.getAdminSummary();
      if (res && res.success && res.summary) {
        setPendingCount(res.summary.pending ?? 0);
      } else {
        setError(res && res.message ? res.message : 'Failed to fetch medical summary');
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch medical summary');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // Call this after approve/reject to refresh count
  const refresh = fetchPending;

  return (
    <MedicalPendingContext.Provider value={{ pendingCount, loading, error, refresh }}>
      {children}
    </MedicalPendingContext.Provider>
  );
}

export function useMedicalPendingContext() {
  return useContext(MedicalPendingContext);
}
