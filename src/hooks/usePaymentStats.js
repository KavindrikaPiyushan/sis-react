import { useState, useEffect, useCallback } from 'react';
import AdminPaymentsService from '../services/admin/paymentsService';

export default function usePaymentStats(isSuperAdmin = false) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminPaymentsService.getPaymentStats();
      if (res && res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res && res.message ? res.message : 'Failed to fetch payment stats');
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch payment stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [fetchStats, isSuperAdmin]);

  return { stats, loading, error, refresh: fetchStats };
}
