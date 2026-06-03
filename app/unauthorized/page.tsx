import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginBottom: '18px', color: '#711C31', fontFamily: 'var(--font-seasons-reg)', fontSize: '30px' }}>
          Access Denied
        </h1>
        <p style={{ marginBottom: '24px', color: '#4b2a32', lineHeight: 1.7 }}>
          You do not have permission to access this page. Please sign in with an admin account.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ backgroundColor: '#711C31', color: '#fff', padding: '12px 20px', borderRadius: '10px', textDecoration: 'none', fontFamily: 'var(--font-seasons-reg)' }}>
            Admin Login
          </Link>
          <Link href="/" style={{ backgroundColor: '#eee', color: '#591727', padding: '12px 20px', borderRadius: '10px', textDecoration: 'none', fontFamily: 'var(--font-seasons-reg)' }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
