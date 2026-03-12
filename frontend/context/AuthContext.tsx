'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister, loginWithGoogle as apiLoginWithGoogle, getMe, AuthPayload, AuthResponse } from '@/lib/api';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (credential: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Rehydrate from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('ag_token');
        const storedUser = localStorage.getItem('ag_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const persist = (data: AuthResponse) => {
        localStorage.setItem('ag_token', data.access_token);
        localStorage.setItem('ag_user', JSON.stringify({
            id: data.user_id,
            username: data.username,
            email: data.email,
        }));
        setToken(data.access_token);
        setUser({ id: data.user_id, username: data.username, email: data.email });
    };

    const login = async (email: string, password: string) => {
        const data = await apiLogin({ email, password });
        persist(data);
    };

    const loginWithGoogle = async (credential: string) => {
        const data = await apiLoginWithGoogle(credential);
        persist(data);
    };

    const register = async (username: string, email: string, password: string) => {
        const data = await apiRegister({ username, email, password });
        persist(data);
    };

    const logout = () => {
        localStorage.removeItem('ag_token');
        localStorage.removeItem('ag_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, loginWithGoogle, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
