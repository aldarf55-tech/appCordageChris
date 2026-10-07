// hooks/useAutoSync.ts
import { useEffect } from 'react';
import { syncWithSupabase } from '@/services/syncService';

export function useAutoSync() {
  useEffect(() => {
    // 1. Synchro au chargement
    syncWithSupabase();

    // 2. Synchro automatique dès que le réseau revient
    const handleOnline = () => {
      syncWithSupabase();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
}