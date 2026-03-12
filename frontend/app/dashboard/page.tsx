'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getRecordings, getStats, deleteRecording, Recording } from '@/lib/api';
import { Mic, Upload, Trash2, Activity, LayoutDashboard, Clock, ChevronRight } from 'lucide-react';

const EMOTION_COLORS: Record<string, string> = {
    happy: '#34D399', sad: '#60A5FA', angry: '#F87171',
    fear: '#FBBF24', disgust: '#A78BFA', neutral: '#94A3B8',
    calm: '#6EE7B7', surprised: '#FB923C', surprise: '#FB923C',
};
const EMOTION_EMOJI: Record<string, string> = {
    happy: '😊', sad: '😢', angry: '😠', fear: '😨',
    disgust: '🤢', neutral: '😐', calm: '😌', surprised: '😲', surprise: '😲',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
    return (
        <div className="glass" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <Icon size={22} color={color} />
            </div>
            <div>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#F1F5F9', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{label}</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);

    const fetchAll = async () => {
        try {
            const [recs, st] = await Promise.all([getRecordings(), getStats()]);
            setRecordings(recs);
            setStats(st);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleDelete = async (id: number) => {
        setDeleting(id);
        try { await deleteRecording(id); setRecordings(r => r.filter(x => x.id !== id)); }
        catch { }
        finally { setDeleting(null); }
    };

    return (
        <ProtectedRoute>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Navbar />
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '90px 24px 60px' }}>

                    {/* Header */}
                    <div style={{ marginBottom: 36 }} className="fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <LayoutDashboard size={20} color="#A78BFA" />
                            <span style={{ color: '#A78BFA', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dashboard</span>
                        </div>
                        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>
                            Welcome back, {user?.username} 👋
                        </h1>
                        <p style={{ color: '#64748B', fontSize: 15 }}>Here's your voice analysis overview.</p>
                    </div>

                    {/* Stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                        <StatCard label="Total Analyses" value={stats?.total ?? '—'} icon={Activity} color="#A78BFA" />
                        <StatCard label="Recorded" value={stats?.recorded ?? '—'} icon={Mic} color="#60A5FA" />
                        <StatCard label="Uploaded" value={stats?.uploaded ?? '—'} icon={Upload} color="#34D399" />
                        <StatCard
                            label="Top Emotion"
                            value={stats?.dominant_emotion ? `${EMOTION_EMOJI[stats.dominant_emotion] || '🎙️'} ${stats.dominant_emotion}` : '—'}
                            icon={Activity}
                            color="#FBBF24"
                        />
                    </div>

                    {/* Quick actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                        <Link href="/record" className="glass" style={{
                            padding: '20px 24px', borderRadius: 16, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14,
                            border: '1px solid rgba(124,58,237,0.2)', transition: 'all 0.3s',
                        }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Mic size={20} color="#A78BFA" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 700, fontSize: 15 }}>Record Voice</p>
                                <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Real-time waveform</p>
                            </div>
                            <ChevronRight size={16} color="#475569" />
                        </Link>

                        <Link href="/upload" className="glass" style={{
                            padding: '20px 24px', borderRadius: 16, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14,
                            border: '1px solid rgba(52,211,153,0.2)', transition: 'all 0.3s',
                        }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Upload size={20} color="#34D399" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 700, fontSize: 15 }}>Upload Audio</p>
                                <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>MP3 or WAV</p>
                            </div>
                            <ChevronRight size={16} color="#475569" />
                        </Link>
                    </div>

                    {/* Recording history */}
                    <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Clock size={16} color="#A78BFA" />
                            <h2 style={{ fontWeight: 700, fontSize: 16 }}>Analysis History</h2>
                            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#475569' }}>{recordings.length} records</span>
                        </div>

                        {loading ? (
                            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
                        ) : recordings.length === 0 ? (
                            <div style={{ padding: 48, textAlign: 'center', color: '#475569' }}>
                                <Mic size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                <p style={{ fontWeight: 600, marginBottom: 8 }}>No recordings yet</p>
                                <p style={{ fontSize: 14 }}>Start by recording your voice or uploading an audio file</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            {['File', 'Source', 'Emotion', 'Confidence', 'Duration', 'Date', ''].map(h => (
                                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recordings.map((r, i) => {
                                            const emotionKey = r.emotion?.toLowerCase() || '';
                                            const color = EMOTION_COLORS[emotionKey] || '#94A3B8';
                                            const emoji = EMOTION_EMOJI[emotionKey] || '🎙️';
                                            return (
                                                <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                                                    <td style={{ padding: '14px 16px', maxWidth: 180 }}>
                                                        <p style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {r.filename}
                                                        </p>
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <span style={{
                                                            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                            background: r.source === 'recorded' ? 'rgba(96,165,250,0.12)' : 'rgba(52,211,153,0.12)',
                                                            color: r.source === 'recorded' ? '#60A5FA' : '#34D399',
                                                        }}>
                                                            {r.source}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        {r.emotion ? (
                                                            <span style={{
                                                                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                                background: `${color}18`, color,
                                                            }}>
                                                                {emoji} {r.emotion}
                                                            </span>
                                                        ) : '—'}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', fontSize: 14 }}>
                                                        {r.confidence ? (
                                                            <span style={{ color, fontWeight: 600 }}>{Math.round(r.confidence * 100)}%</span>
                                                        ) : '—'}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#94A3B8' }}>
                                                        {r.duration ? `${r.duration}s` : '—'}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>
                                                        {formatDate(r.created_at)}
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <button
                                                            onClick={() => handleDelete(r.id)}
                                                            disabled={deleting === r.id}
                                                            style={{
                                                                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                                                                borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#F87171',
                                                                display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                                                            }}
                                                        >
                                                            {deleting === r.id ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={13} />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
