'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Mic, Upload, Brain, Shield, Zap, ChevronRight, Wand2, Activity, Globe } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Real-Time Recording',
    desc: 'Record your voice with live waveform visualization powered by the Web Audio API.',
    color: '#A78BFA',
  },
  {
    icon: Brain,
    title: 'AI Emotion Analysis',
    desc: 'Deep learning model trained on thousands of voice samples detects 7+ emotions with high accuracy.',
    color: '#60A5FA',
  },
  {
    icon: Upload,
    title: 'Audio Upload',
    desc: 'Upload existing MP3 or WAV files and get instant emotion analysis results.',
    color: '#34D399',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'JWT-based authentication keeps your data private. Your audio is yours alone.',
    color: '#FBBF24',
  },
  {
    icon: Activity,
    title: 'Analysis History',
    desc: 'All your recordings and results are saved so you can track your emotional patterns over time.',
    color: '#F87171',
  },
  {
    icon: Globe,
    title: 'Cloud Deployed',
    desc: 'Accessible anywhere, anytime. Deployed on industry-grade cloud infrastructure.',
    color: '#FB923C',
  },
];

const emotions = [
  { label: 'Happy', color: '#34D399', pct: 81 },
  { label: 'Sad', color: '#60A5FA', pct: 12 },
  { label: 'Angry', color: '#F87171', pct: 4 },
  { label: 'Neutral', color: '#94A3B8', pct: 3 },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div style={{ maxWidth: 800, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 20,
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
            marginBottom: 32,
          }}>
            <Zap size={14} color="#A78BFA" />
            <span style={{ fontSize: 13, color: '#A78BFA', fontWeight: 600 }}>AI-Powered Voice Analysis</span>
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 900, lineHeight: 1.08, marginBottom: 24, letterSpacing: '-0.03em' }}>
            Discover What Your{' '}
            <span className="gradient-text">Voice Reveals</span>
          </h1>

          <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px', fontWeight: 400 }}>
            Speech Emotion Recognition uses deep learning to analyze the emotion in your voice in real time.
            Record, upload, and understand yourself on a whole new level.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ fontSize: 16, padding: '14px 28px' }}>
              Start Analyzing Free
              <ChevronRight size={18} />
            </Link>
            <Link href="/signin" className="btn-secondary" style={{ fontSize: 16, padding: '14px 28px' }}>
              Sign In
            </Link>
          </div>

          {/* Demo card */}
          <div className="glass" style={{ marginTop: 60, padding: 28, borderRadius: 24, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Wand2 size={18} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>Voice Analysis Result</p>
                <p style={{ fontSize: 12, color: '#64748B' }}>2.4 seconds · recorded</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                  😊 Happy
                </span>
              </div>
            </div>
            {/* Fake waveform */}
            <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 40, marginBottom: 16 }}>
              {Array.from({ length: 48 }, (_, i) => {
                const h = 4 + Math.sin(i * 0.7) * 14 + Math.random() * 8;
                return (
                  <div key={i} style={{
                    flex: 1, height: h, borderRadius: 2,
                    background: 'linear-gradient(to top, #7C3AED, #A78BFA)',
                    opacity: 0.7,
                  }} />
                );
              })}
            </div>
            {/* Emotion bars */}
            {emotions.map(({ label, color, pct }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ width: 60, fontSize: 12, color: '#94A3B8' }}>{label}</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                </div>
                <span style={{ width: 36, fontSize: 12, color, fontWeight: 600, textAlign: 'right' }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 16 }}>
              Everything You Need
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              A complete voice emotion analysis platform, built for your final year project and beyond.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass" style={{ padding: 28, borderRadius: 20, transition: 'all 0.3s' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${color}18`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div className="glass" style={{ padding: '48px 32px', borderRadius: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at center, rgba(124,58,237,0.15) 0%, transparent 70%)',
            }} />
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, position: 'relative' }}>
              Ready to Analyze Your Voice?
            </h2>
            <p style={{ color: '#94A3B8', marginBottom: 28, position: 'relative' }}>
              Create a free account and get instant emotion analysis.
            </p>
            <Link href="/signup" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px', position: 'relative' }}>
              Get Started — It's Free
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#475569', fontSize: 13 }}>
        © 2026 Speech Emotion Recognition · Final Year Project
      </footer>
    </div>
  );
}
