'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setAuth, endDashboardSession } from '@/utils/auth';
import { apiUrl } from '@/utils/api';
import { fetchLoginRoles, requestPasswordReset } from '@/utils/adminManagementApi';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleSlug, setRoleSlug] = useState('');
  const [roles, setRoles] = useState<{ name: string; slug: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetNote, setResetNote] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    endDashboardSession();
  }, []);

  useEffect(() => {
    fetchLoginRoles()
      .then((items) => setRoles(items))
      .catch(() => setRoles([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, roleSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Login failed');
        return;
      }

      if (!data.admin || !data.admin.roleSlug) {
        endDashboardSession();
        router.replace('/unauthorized');
        return;
      }

      setAuth(data.token, data.admin);
      router.replace('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');
    setResetLoading(true);

    try {
      const message = await requestPasswordReset({
        email: email.trim(),
        note: resetNote.trim(),
      });
      setResetMessage(message);
      setShowResetForm(false);
      setResetNote('');
    } catch (err) {
      setResetMessage(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setResetLoading(false);
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
            placeholder="drghita101@gmail.com"
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '18px', fontSize: '14px', fontFamily: 'var(--font-seasons-reg)' }}
          />

          <label style={{ display: 'block', marginBottom: '8px', color: '#591727', fontFamily: 'var(--font-seasons-reg)', fontSize: '14px' }}>
            Password
          </label>
          <div style={{ position: 'relative', marginBottom: '18px' }}>
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
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <label style={{ display: 'block', marginBottom: '8px', color: '#591727', fontFamily: 'var(--font-seasons-reg)', fontSize: '14px' }}>
            Role
          </label>
          <select
            value={roleSlug}
            onChange={(e) => setRoleSlug(e.target.value)}
            required
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '18px', fontSize: '14px', fontFamily: 'var(--font-seasons-reg)', backgroundColor: '#fff', color: '#591727' }}
          >
            <option value="" disabled>
              Select your assigned role
            </option>
            {roles.map((role) => (
              <option key={role.slug} value={role.slug}>
                {role.name}
              </option>
            ))}
          </select>

          {error && (
            <div style={{ marginBottom: '16px', color: '#c33', background: '#fee', padding: '12px 14px', borderRadius: '10px' }}>
              {error}
            </div>
          )}

          {resetMessage && (
            <div style={{ marginBottom: '16px', color: '#2f6b2f', background: '#eef8ee', padding: '12px 14px', borderRadius: '10px' }}>
              {resetMessage}
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

        <div style={{ marginTop: '18px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setShowResetForm((prev) => !prev)}
            style={{ background: 'none', border: 'none', color: '#591727', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Forgot password? Request reset from Super Admin
          </button>
        </div>

        {showResetForm && (
          <form onSubmit={handlePasswordResetRequest} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ddd' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#591727', fontSize: '13px' }}>
              Optional note for Super Admin
            </label>
            <textarea
              value={resetNote}
              onChange={(e) => setResetNote(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '12px', fontSize: '13px', resize: 'vertical' }}
            />
            <button
              type="submit"
              disabled={resetLoading || !email.trim()}
              style={{ width: '100%', backgroundColor: '#591727', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', cursor: resetLoading ? 'not-allowed' : 'pointer' }}
            >
              {resetLoading ? 'Submitting...' : 'Submit password reset request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
