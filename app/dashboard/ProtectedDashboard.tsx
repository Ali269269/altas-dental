'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getAdmin } from '@/utils/auth';

interface ProtectedDashboardProps {
  children: React.ReactNode;
}

export default function ProtectedDashboard({ children }: ProtectedDashboardProps) {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const admin = getAdmin();

    if (!token || !admin) {
      router.replace('/login');
      return;
    }

    if (admin.role !== 'admin') {
      router.replace('/unauthorized');
      return;
    }

    setIsReady(true);
  }, [router]);

  if (!isReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#591727', fontSize: '18px' }}>Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
