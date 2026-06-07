'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, validateAuthSession } from '@/utils/auth';

export default function AdminRoutePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAccess() {
      if (!isAuthenticated()) {
        router.replace('/login');
        return;
      }

      const admin = await validateAuthSession();
      if (!admin) {
        router.replace('/login');
        return;
      }

      if (!admin.roleSlug && !admin.isSuperAdmin) {
        router.replace('/unauthorized');
        return;
      }

      router.replace('/dashboard');
    }

    void checkAccess();
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#591727', marginBottom: '12px' }}>Checking admin access...</p>
      </div>
    </div>
  );
}
