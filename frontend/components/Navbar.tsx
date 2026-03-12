'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Mic, Upload, LayoutDashboard, LogOut, Menu, X, Wand2, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const navLinks = user
        ? [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/record', label: 'Record', icon: Mic },
            { href: '/upload', label: 'Upload', icon: Upload },
        ]
        : [];

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
                        }}>
                            <Wand2 size={18} color="white" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
                            Speech <span style={{ color: 'var(--violet-light)' }}>Emotion</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 14px', borderRadius: 10, textDecoration: 'none',
                                    fontSize: 14, fontWeight: 500,
                                    color: pathname === href ? '#A78BFA' : '#94A3B8',
                                    background: pathname === href ? 'rgba(124,58,237,0.15)' : 'transparent',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Icon size={15} />
                                {label}
                            </Link>
                        ))}

                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 13, fontWeight: 700, color: 'white',
                                    }}>
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: 14, color: '#CBD5E1' }}>{user.username}</span>
                                </div>
                                <button onClick={handleLogout} style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                                    borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'transparent', color: '#94A3B8', fontSize: 14, cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}>
                                    <LogOut size={15} />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
                                <Link href="/signin" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 14 }}>Sign In</Link>
                                <Link href="/signup" className="btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}>Get Started</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                        className="mobile-menu-btn"
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div style={{
                    padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'var(--nav-bg)',
                }}>
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href}
                            onClick={() => setMobileOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
                                color: pathname === href ? '#A78BFA' : '#94A3B8', textDecoration: 'none',
                                borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 15,
                            }}>
                            <Icon size={16} /> {label}
                        </Link>
                    ))}
                    <button onClick={toggleTheme} style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, width: '100%', padding: 12, borderRadius: 10,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14,
                    }}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    {user ? (
                        <button onClick={handleLogout} style={{
                            marginTop: 12, width: '100%', padding: 12, borderRadius: 10,
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14,
                        }}>Sign Out</button>
                    ) : (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <Link href="/signin" className="btn-secondary" style={{ flex: 1, padding: '10px 0' }}>Sign In</Link>
                            <Link href="/signup" className="btn-primary" style={{ flex: 1, padding: '10px 0' }}>Get Started</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
