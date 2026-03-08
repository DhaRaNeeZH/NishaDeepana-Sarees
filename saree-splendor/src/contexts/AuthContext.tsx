import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../lib/types';
import { api } from '../lib/api';

interface AuthContextType extends AuthState {
    login: (email: string, password: string, role?: 'customer' | 'admin') => Promise<boolean>;
    register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
    });

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const user: User = JSON.parse(storedUser);
                setAuthState({
                    user,
                    isAuthenticated: true,
                    isAdmin: user.role === 'admin',
                });
            } catch {
                localStorage.removeItem('currentUser');
            }
        }
    }, []);

    const login = async (email: string, password: string, _role: 'customer' | 'admin' = 'customer'): Promise<boolean> => {
        try {
            const data = await api.login(email, password);
            const user: User = data.user;

            // Store token for API auth
            localStorage.setItem('nd_token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            setAuthState({
                user,
                isAuthenticated: true,
                isAdmin: user.role === 'admin',
            });

            return true;
        } catch {
            return false;
        }
    };

    const register = async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/register`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, phone }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Registration failed' };
            }

            const user: User = data.user;
            localStorage.setItem('nd_token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            setAuthState({
                user,
                isAuthenticated: true,
                isAdmin: user.role === 'admin',
            });

            return { success: true };
        } catch {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        setAuthState({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
        });
        localStorage.removeItem('currentUser');
        localStorage.removeItem('nd_token');
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
