'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getAdmin } from '@/utils/auth';

export default function AdminRoutePage() {
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

    router.replace('/dashboard');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#591727', marginBottom: '12px' }}>Checking admin access...</p>
      </div>
    </div>
  );
}
