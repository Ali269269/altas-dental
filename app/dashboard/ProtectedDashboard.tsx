'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, validateAuthSession } from '@/utils/auth';
import { usePermissions } from '@/context/PermissionsContext';
import DashboardRouteGuard from '@/components/admin/DashboardRouteGuard';
import { useDashboardAuthGuard } from '@/hooks/useDashboardAuthGuard';

interface ProtectedDashboardProps {
  children: React.ReactNode;
}

export default function ProtectedDashboard({ children }: ProtectedDashboardProps) {
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const { session, loading, refreshSession } = usePermissions();

  useDashboardAuthGuard();

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      if (!isAuthenticated()) {
        router.replace('/login');
        return;
      }

      const validSession = await validateAuthSession();
      if (cancelled) return;

      if (!validSession) {
        router.replace('/login');
        return;
      }

      await refreshSession();
      if (!cancelled) {
        setVerified(true);
      }
    }

    void verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [router, refreshSession]);

  if (!verified || loading || !session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#591727', fontSize: '18px' }}>Verifying access...</p>
      </div>
    );
  }

  return <DashboardRouteGuard>{children}</DashboardRouteGuard>;
}
