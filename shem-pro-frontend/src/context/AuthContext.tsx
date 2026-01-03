import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { authApi } from '../services/authApi';
import { supabase } from '../lib/supabaseClient';

interface User {
    username?: string;
    email?: string;
    id?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithMagicLink: (email: string) => Promise<{ error: any }>;
    loginWithGoogle: () => Promise<{ error: any }>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Check for token on initial load
    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                // Check local storage token first (Legacy/Backend Auth)
                const token = localStorage.getItem('token');
                if (token) {
                    if (mounted) setUser({ email: 'user@example.com' });
                } else {
                    // Check Supabase Session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user && mounted) {
                        const userData: User = {
                            email: session.user.email,
                            id: session.user.id,
                            username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
                        };
                        setUser(userData);
                    }
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        checkAuth();

        // Listen for Supabase auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
            if (session?.user && mounted) {
                const userData: User = {
                    email: session.user.email,
                    id: session.user.id,
                    username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
                };
                setUser(userData);

                // Sync with Backend (Upsert User)
                try {
                    const { error } = await supabase
                        .from('users')
                        .upsert({
                            id: session.user.id,
                            email: session.user.email,
                            username: userData.username,
                            updated_at: new Date()
                        }, { onConflict: 'id' });

                    if (error) console.error("Profile Sync Error:", error);
                } catch (syncErr) {
                    console.error("Profile Sync Exception:", syncErr);
                }

                setLoading(false);
            } else if (!localStorage.getItem('token') && mounted) {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        // Demo Mode Bypass
        if (email === 'demo@shem.pro' && password === 'demo123') {
            const demoUser = { username: 'Demo User', email: 'demo@shem.pro', id: 'demo-123' };
            localStorage.setItem('token', 'demo-token-bypass');
            setUser(demoUser);
            return;
        }

        try {
            await authApi.loginUser(email, password);
            setUser({ email });
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const loginWithMagicLink = async (email: string) => {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                },
            });
            return { error };
        } catch (error) {
            console.error("Magic Link failed", error);
            return { error };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });
            return { error };
        } catch (error) {
            console.error("Google Login failed", error);
            return { error };
        }
    };

    const register = async (userData: any) => {
        try {
            const data = await authApi.registerUser(userData);
            if (data.token) {
                localStorage.setItem('token', data.token);
                setUser({ email: userData.email });
            }
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = async () => {
        authApi.logoutUser();
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            loginWithMagicLink,
            loginWithGoogle,
            register,
            logout,
            isAuthenticated: !!user
        }}>
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                    <p className="mt-4 text-gray-600 font-semibold">Loading SHEM...</p>
                </div>
            ) : (
                children
            )}
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
