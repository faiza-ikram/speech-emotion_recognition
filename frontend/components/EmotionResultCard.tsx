'use client';

import { PredictResponse } from '@/lib/api';
import {
    RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip,
} from 'recharts';

const EMOTION_COLORS: Record<string, string> = {
    happy: '#34D399',
    sad: '#60A5FA',
    angry: '#F87171',
    fear: '#FBBF24',
    disgust: '#A78BFA',
    neutral: '#94A3B8',
    calm: '#6EE7B7',
    surprised: '#FB923C',
    surprise: '#FB923C',
};

const EMOTION_EMOJI: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fear: '😨',
    disgust: '🤢',
    neutral: '😐',
    calm: '😌',
    surprised: '😲',
    surprise: '😲',
};

interface Props {
    result: PredictResponse;
}

export default function EmotionResultCard({ result }: Props) {
    const { emotion, confidence, probabilities } = result;
    const color = EMOTION_COLORS[emotion.toLowerCase()] || '#A78BFA';
    const emoji = EMOTION_EMOJI[emotion.toLowerCase()] || '🎙️';

    const chartData = Object.entries(probabilities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: Math.round(value * 100),
            fill: EMOTION_COLORS[name.toLowerCase()] || '#A78BFA',
        }));

    return (
        <div className="glass fade-in" style={{ padding: 28, borderRadius: 20 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 56, marginBottom: 8 }}>{emoji}</div>
                <h3 style={{
                    fontSize: 28, fontWeight: 800, textTransform: 'capitalize',
                    color: color, marginBottom: 4,
                }}>
                    {emotion}
                </h3>
                <p style={{ color: '#94A3B8', fontSize: 14 }}>
                    Detected Emotion
                </p>
            </div>

            {/* Confidence bar */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>Confidence</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: color }}>
                        {Math.round(confidence * 100)}%
                    </span>
                </div>
                <div style={{
                    width: '100%', height: 8, background: 'rgba(255,255,255,0.08)',
                    borderRadius: 4, overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${Math.round(confidence * 100)}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                        borderRadius: 4,
                        transition: 'width 1s ease',
                    }} />
                </div>
            </div>

            {/* Probability bars */}
            <div>
                <p style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Emotion Distribution
                </p>
                {chartData.map(({ name, value, fill }) => (
                    <div key={name} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, color: '#CBD5E1' }}>{name}</span>
                            <span style={{ fontSize: 13, color: fill, fontWeight: 600 }}>{value}%</span>
                        </div>
                        <div style={{
                            width: '100%', height: 6, background: 'rgba(255,255,255,0.06)',
                            borderRadius: 3, overflow: 'hidden',
                        }}>
                            <div style={{
                                width: `${value}%`, height: '100%',
                                background: fill, borderRadius: 3,
                                transition: 'width 0.8s ease',
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
