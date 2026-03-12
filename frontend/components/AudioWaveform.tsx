'use client';

import { useEffect, useRef } from 'react';

interface AudioWaveformProps {
    isRecording: boolean;
    stream?: MediaStream | null;
}

export default function AudioWaveform({ isRecording, stream }: AudioWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    useEffect(() => {
        if (!isRecording || !stream) {
            // Draw idle flat wave
            drawIdle();
            return;
        }

        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animFrameRef.current = requestAnimationFrame(draw);
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d')!;
            const W = canvas.width;
            const H = canvas.height;

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, W, H);

            const barCount = 48;
            const barWidth = (W / barCount) * 0.65;
            const gap = (W / barCount) * 0.35;
            let x = 0;

            for (let i = 0; i < barCount; i++) {
                const dataIdx = Math.floor((i / barCount) * bufferLength);
                const value = dataArray[dataIdx] / 255;
                const barH = Math.max(4, value * H * 0.9);

                const gradient = ctx.createLinearGradient(0, H / 2 - barH / 2, 0, H / 2 + barH / 2);
                gradient.addColorStop(0, 'rgba(167, 139, 250, 0.9)');
                gradient.addColorStop(0.5, 'rgba(124, 58, 237, 1)');
                gradient.addColorStop(1, 'rgba(167, 139, 250, 0.9)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, H / 2 - barH / 2, barWidth, barH, 3);
                ctx.fill();

                x += barWidth + gap;
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            source.disconnect();
            audioCtx.close();
        };
    }, [isRecording, stream]);

    const drawIdle = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const barCount = 48;
        const barWidth = (W / barCount) * 0.65;
        const gap = (W / barCount) * 0.35;
        let x = 0;

        for (let i = 0; i < barCount; i++) {
            ctx.fillStyle = 'rgba(124, 58, 237, 0.2)';
            ctx.beginPath();
            ctx.roundRect(x, H / 2 - 3, barWidth, 6, 3);
            ctx.fill();
            x += barWidth + gap;
        }
    };

    return (
        <div style={{
            width: '100%', borderRadius: 16,
            background: 'rgba(124, 58, 237, 0.06)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            padding: '20px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <canvas
                ref={canvasRef}
                width={560}
                height={80}
                style={{ width: '100%', maxWidth: 560, height: 80 }}
                onLoad={drawIdle}
            />
        </div>
    );
}
