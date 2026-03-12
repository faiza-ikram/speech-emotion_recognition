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

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
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
