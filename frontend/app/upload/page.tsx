'use client';

import { useState, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmotionResultCard from '@/components/EmotionResultCard';
import { predictAudio, PredictResponse } from '@/lib/api';
import { Upload, FileAudio, X, Send, CheckCircle } from 'lucide-react';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<PredictResponse | null>(null);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (f: File) => {
        const allowed = ['audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mpeg', 'audio/mp3'];
        const ext = f.name.split('.').pop()?.toLowerCase();
        if (!allowed.includes(f.type) && !['wav', 'mp3'].includes(ext || '')) {
            setError('Please select a WAV or MP3 file.');
            return;
        }
        setFile(f);
        setResult(null);
        setError('');
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, []);

    const analyze = async () => {
        if (!file) return;
        setAnalyzing(true);
        setError('');
        try {
            const data = await predictAudio(file, 'uploaded');
            setResult(data);
        } catch (e: any) {
            setError(e?.response?.data?.detail || 'Analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const reset = () => { setFile(null); setResult(null); setError(''); };

    const formatSize = (bytes: number) => bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

    return (
        <ProtectedRoute>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Navbar />
                <div style={{ maxWidth: 720, margin: '0 auto', padding: '90px 24px 60px' }}>

                    {/* Header */}
                    <div style={{ marginBottom: 32 }} className="fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Upload size={18} color="#34D399" />
                            <span style={{ color: '#34D399', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Audio Upload</span>
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Upload Audio File</h1>
                        <p style={{ color: '#64748B', fontSize: 15 }}>Upload a WAV or MP3 file to analyze the emotions in it.</p>
                    </div>

                    {/* Drop zone */}
                    <div className="fade-in">
                        <input
                            ref={inputRef} type="file" accept=".wav,.mp3,audio/wav,audio/mpeg"
                            style={{ display: 'none' }}
                            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                        />

                        {!file ? (
                            <div
                                onClick={() => inputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={onDrop}
                                style={{
                                    border: `2px dashed ${dragging ? 'rgba(52,211,153,0.6)' : 'rgba(255,255,255,0.12)'}`,
                                    borderRadius: 20, padding: '56px 24px', textAlign: 'center', cursor: 'pointer',
                                    background: dragging ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.25s',
                                }}
                            >
                                <div style={{
                                    width: 64, height: 64, borderRadius: 18,
                                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                                }}>
                                    <Upload size={28} color="#34D399" />
                                </div>
                                <p style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                                    {dragging ? 'Drop it here!' : 'Drag & drop your audio file'}
                                </p>
                                <p style={{ color: '#64748B', fontSize: 14, marginBottom: 16 }}>or click to browse your files</p>
                                <span style={{
                                    display: 'inline-block', padding: '6px 16px', borderRadius: 20,
                                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                                    color: '#34D399', fontSize: 13, fontWeight: 500,
                                }}>
                                    WAV and MP3 supported
                                </span>
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
                                {/* File card */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: result ? 24 : 0 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12,
                                        background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <FileAudio size={22} color="#34D399" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: 15 }}>{file.name}</p>
                                        <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{formatSize(file.size)}</p>
                                    </div>
                                    {result && <CheckCircle size={22} color="#34D399" />}
                                    {!result && (
                                        <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Playback */}
                                <div style={{ marginBottom: 20 }}>
                                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                                    <audio controls src={URL.createObjectURL(file)} style={{ width: '100%', borderRadius: 8 }} />
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {!result ? (
                                        <>
                                            <button onClick={analyze} disabled={analyzing} className="btn-primary" style={{ flex: 1, gap: 8 }}>
                                                {analyzing ? <div className="spinner" /> : <Send size={15} />}
                                                {analyzing ? 'Analyzing...' : 'Analyze Emotion'}
                                            </button>
                                            <button onClick={reset} className="btn-secondary">
                                                <X size={15} />
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={reset} className="btn-secondary" style={{ flex: 1 }}>
                                            Upload Another
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div style={{
                                padding: '12px 16px', borderRadius: 10, marginTop: 16,
                                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)',
                                color: '#FCA5A5', fontSize: 14,
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Result */}
                        {result && (
                            <div style={{ marginTop: 24 }}>
                                <EmotionResultCard result={result} />
                            </div>
                        )}

                        {/* Tips */}
                        {!file && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
                                {[
                                    { emoji: '📁', tip: 'Supports WAV and MP3 formats' },
                                    { emoji: '⏱️', tip: '2–10 seconds works best' },
                                    { emoji: '🔊', tip: 'Clear speech for better accuracy' },
                                ].map(({ emoji, tip }) => (
                                    <div key={tip} className="glass" style={{ padding: 16, borderRadius: 14, textAlign: 'center' }}>
                                        <div style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</div>
                                        <p style={{ fontSize: 13, color: '#94A3B8' }}>{tip}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
