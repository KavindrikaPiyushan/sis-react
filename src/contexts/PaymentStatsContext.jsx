import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import usePaymentStats from '../hooks/usePaymentStats';
import { useAuth } from '../services/AuthContext';

const PaymentStatsContext = createContext();


export function PaymentStatsProvider({ children }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const { stats, loading, refresh } = usePaymentStats(isSuperAdmin);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!loading && stats) {
      setPendingCount(stats.byStatus?.pending ?? 0);
    }
  }, [stats, loading]);

  // Expose refresh for manual updates (e.g., after approval)
  return (
    <PaymentStatsContext.Provider value={{ pendingCount, refresh }}>
      {children}
    </PaymentStatsContext.Provider>
  );
}

export function usePaymentStatsContext() {
  return useContext(PaymentStatsContext);
}
