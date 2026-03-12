'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Wand2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import GoogleSignIn from '@/components/GoogleSignIn';

export default function SignInPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
            <Navbar />
            <div className="orb orb-1" style={{ opacity: 0.25 }} />
            <div className="orb orb-2" style={{ opacity: 0.2 }} />

            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px' }}>
                <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: '0 0 30px rgba(124,58,237,0.4)',
                        }}>
                            <Wand2 size={24} color="white" />
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome Back</h1>
                        <p style={{ color: '#94A3B8', fontSize: 15 }}>Sign in to your account</p>
                    </div>

                    <div className="glass" style={{ padding: 32, borderRadius: 20 }}>
                        {error && (
                            <div style={{
                                padding: '12px 16px', borderRadius: 10, marginBottom: 20,
                                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                                color: '#FCA5A5', fontSize: 14,
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, marginBottom: 6, display: 'block' }}>Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="email" required placeholder="you@example.com"
                                        className="form-input" style={{ paddingLeft: 42 }}
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, marginBottom: 6, display: 'block' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                                        className="form-input" style={{ paddingLeft: 42, paddingRight: 42 }}
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)} style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#475569',
                                    }}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: 4, padding: '14px 0' }}>
                                {loading ? <div className="spinner" /> : 'Sign In'}
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>or</span>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            </div>
                            <GoogleSignIn onError={setError} />
                        </form>

                        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
                            Don't have an account?{' '}
                            <Link href="/signup" style={{ color: '#A78BFA', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
