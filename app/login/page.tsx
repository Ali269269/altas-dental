'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setAuth, getToken, getAdmin, clearAuth } from '@/utils/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    const admin = getAdmin();

    if (token && admin && admin.role === 'admin') {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data && data.message) {
          setError(data.message);
        } else {
          setError('Login failed');
        }
        return;
      }

      if (!data.admin || data.admin.role !== 'admin') {
        clearAuth();
        router.replace('/unauthorized');
        return;
      }

      setAuth(data.token, data.admin);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#f3f3f3', borderRadius: '16px', padding: '32px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginBottom: '24px', color: '#711C31', fontFamily: 'var(--font-seasons-reg)', fontSize: '28px', textAlign: 'center' }}>
          Admin Login
        </h1>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#591727', fontFamily: 'var(--font-seasons-reg)', fontSize: '14px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@altasdental.com"
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '18px', fontSize: '14px', fontFamily: 'var(--font-seasons-reg)' }}
          />

          <label style={{ display: 'block', marginBottom: '8px', color: '#591727', fontFamily: 'var(--font-seasons-reg)', fontSize: '14px' }}>
            Password
          </label>
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'var(--font-seasons-reg)', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', color: '#711C31' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
  // Eye icon (password is visible)
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#711C31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
) : (
  // Eye-off icon (password hidden)
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#711C31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)}
            
            </button>
          </div>



          {error && (
            <div style={{ marginBottom: '16px', color: '#c33', background: '#fee', padding: '12px 14px', borderRadius: '10px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#711C31', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-seasons-reg)' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        
      </div>
    </div>
  );
}
