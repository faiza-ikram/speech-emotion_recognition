'use client';

import { useState, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import AudioWaveform from '@/components/AudioWaveform';
import EmotionResultCard from '@/components/EmotionResultCard';
import { predictAudio, PredictResponse } from '@/lib/api';
import { Mic, MicOff, Square, Send, RotateCcw } from 'lucide-react';

export default function RecordPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [result, setResult] = useState<PredictResponse | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [recordingSeconds, setRecordingSeconds] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startRecording = useCallback(async () => {
        setError('');
        setAudioBlob(null);
        setAudioUrl(null);
        setResult(null);
        setRecordingSeconds(0);

        try {
            const str = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(str);

            const recorder = new MediaRecorder(str, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                str.getTracks().forEach(t => t.stop());
                setStream(null);
            };

            recorder.start(100);
            setIsRecording(true);

            timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
        } catch {
            setError('Microphone access denied. Please allow microphone permissions.');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    }, []);

    const analyze = async () => {
        if (!audioBlob) return;
        setAnalyzing(true);
        setError('');
        try {
            const data = await predictAudio(audioBlob, 'recorded');
            setResult(data);
        } catch (e: any) {
            setError(e?.response?.data?.detail || 'Analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const reset = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setResult(null);
        setError('');
        setRecordingSeconds(0);
    };

    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <ProtectedRoute>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Navbar />
                <div style={{ maxWidth: 720, margin: '0 auto', padding: '90px 24px 60px' }}>

                    {/* Header */}
                    <div style={{ marginBottom: 32 }} className="fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Mic size={18} color="#A78BFA" />
                            <span style={{ color: '#A78BFA', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Voice Recording</span>
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Record Your Voice</h1>
                        <p style={{ color: '#64748B', fontSize: 15 }}>Speak naturally for at least 2–3 seconds for best results.</p>
                    </div>

                    <div className="glass fade-in" style={{ padding: 32, borderRadius: 20, marginBottom: 24 }}>
                        {/* Waveform */}
                        <AudioWaveform isRecording={isRecording} stream={stream} />

                        {/* Timer */}
                        <div style={{ textAlign: 'center', margin: '20px 0', fontVariantNumeric: 'tabular-nums' }}>
                            <span style={{
                                fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em',
                                color: isRecording ? '#F87171' : '#475569',
                            }}>
                                {formatTime(recordingSeconds)}
                            </span>
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {!isRecording && !audioBlob && (
                                <button onClick={startRecording} className="btn-primary" style={{ gap: 10 }}>
                                    <Mic size={18} />
                                    Start Recording
                                </button>
                            )}

                            {isRecording && (
                                <button onClick={stopRecording} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 28px',
                                    background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.35)',
                                    borderRadius: 12, color: '#F87171', fontWeight: 600, cursor: 'pointer', fontSize: 15,
                                }}>
                                    <Square size={16} fill="#F87171" />
                                    Stop Recording
                                </button>
                            )}

                            {audioBlob && !result && (
                                <>
                                    <button onClick={analyze} className="btn-primary" disabled={analyzing} style={{ gap: 10 }}>
                                        {analyzing ? <div className="spinner" /> : <Send size={16} />}
                                        {analyzing ? 'Analyzing...' : 'Analyze Emotion'}
                                    </button>
                                    <button onClick={reset} className="btn-secondary" style={{ gap: 8 }}>
                                        <RotateCcw size={15} />
                                        Re-record
                                    </button>
                                </>
                            )}

                            {result && (
                                <button onClick={reset} className="btn-secondary" style={{ gap: 8 }}>
                                    <RotateCcw size={15} />
                                    Record Again
                                </button>
                            )}
                        </div>

                        {/* Recorded playback */}
                        {audioUrl && (
                            <div style={{ marginTop: 20 }}>
                                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>Preview recording:</p>
                                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                                <audio controls src={audioUrl} style={{ width: '100%', borderRadius: 8 }} />
                            </div>
                        )}
                    </div>

                    {/* Tips */}
                    {!result && !isRecording && !audioBlob && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            {[
                                { emoji: '🎙️', tip: 'Speak clearly and naturally' },
                                { emoji: '⏱️', tip: 'Record at least 2–3 seconds' },
                                { emoji: '🔇', tip: 'Minimize background noise' },
                            ].map(({ emoji, tip }) => (
                                <div key={tip} className="glass" style={{ padding: '16px', borderRadius: 14, textAlign: 'center' }}>
                                    <div style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</div>
                                    <p style={{ fontSize: 13, color: '#94A3B8' }}>{tip}</p>
                                </div>
                            ))}
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
                </div>
            </div>
        </ProtectedRoute>
    );
}
