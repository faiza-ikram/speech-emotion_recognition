import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('ag_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// On 401 → clear token and redirect to signin
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('ag_token');
            localStorage.removeItem('ag_user');
            window.location.href = '/signin';
        }
        return Promise.reject(error);
    }
);

// ── Auth ────────────────────────────────────────────────────────────────────────
export interface AuthPayload { username?: string; email: string; password: string; }
export interface AuthResponse { access_token: string; user_id: number; username: string; email: string; }

export const register = (data: AuthPayload) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const login = (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data);

export const loginWithGoogle = (credential: string) =>
    api.post<AuthResponse>('/auth/google', { credential }).then((r) => r.data);

export const getMe = () =>
    api.get('/auth/me').then((r) => r.data);

// ── Predict ─────────────────────────────────────────────────────────────────────
export interface PredictResponse {
    emotion: string;
    confidence: number;
    probabilities: Record<string, number>;
    recording_id: number;
    duration: number;
}

export const predictAudio = (file: File | Blob, source: 'recorded' | 'uploaded' = 'uploaded') => {
    const form = new FormData();
    form.append('file', file, file instanceof File ? file.name : 'recording.wav');
    return api.post<PredictResponse>(`/predict?source=${source}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
};

// ── Recordings ──────────────────────────────────────────────────────────────────
export interface Recording {
    id: number;
    filename: string;
    source: string;
    emotion: string | null;
    confidence: number | null;
    probabilities: Record<string, number> | null;
    duration: number | null;
    created_at: string;
}

export const getRecordings = () =>
    api.get<Recording[]>('/recordings').then((r) => r.data);

export const getStats = () =>
    api.get('/recordings/stats').then((r) => r.data);

export const deleteRecording = (id: number) =>
    api.delete(`/recordings/${id}`);
