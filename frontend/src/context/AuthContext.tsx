import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'customer';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('ig_token');
        const savedUser = localStorage.getItem('ig_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = (t: string, u: User) => {
        setToken(t);
        setUser(u);
        localStorage.setItem('ig_token', t);
        localStorage.setItem('ig_user', JSON.stringify(u));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('ig_token');
        localStorage.removeItem('ig_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
