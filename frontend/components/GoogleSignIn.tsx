'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleSignInProps {
  onError?: (err: string) => void;
  onSuccess?: () => void;
}

export default function GoogleSignIn({ onError, onSuccess }: GoogleSignInProps) {
  const { loginWithGoogle } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      onError?.('No credential received from Google');
      return;
    }
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      onSuccess?.();
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Google sign-in failed';
      onError?.(msg || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // If no Google Client ID is configured, show a disabled placeholder button
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
        <div style={{
          width: '100%',
          maxWidth: 320,
          padding: '10px 16px',
          borderRadius: 6,
          border: '1px solid rgba(148,163,184,0.3)',
          background: 'rgba(148,163,184,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          cursor: 'not-allowed',
          opacity: 0.5,
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"/>
            <path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"/>
            <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50"/>
            <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2"/>
          </svg>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
            Continue with Google
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8, position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.15)', borderRadius: 6,
        }}>
          <div className="spinner" />
        </div>
      )}
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.('Google sign-in was cancelled or failed')}
        useOneTap={false}
        theme={theme === 'dark' ? 'filled_black' : 'outline'}
        size="large"
        text="continue_with"
        shape="rectangular"
        width="320"
      />
    </div>
  );
}
