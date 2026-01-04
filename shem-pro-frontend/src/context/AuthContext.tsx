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

        // Failsafe: If Auth takes longer than 5 seconds, force load content
        const safetyTimer = setTimeout(() => {
            if (mounted) {
                console.warn("AuthContext: Safety timer triggered. Forcing loading=false.");
                setLoading(false);
            }
        }, 5000);

        const checkAuth = async () => {
            try {
                console.log("AuthContext: Starting Auth Check...");
                // Check local storage token first (Legacy/Backend Auth)
                const token = localStorage.getItem('token');
                if (token) {
                    console.log("AuthContext: Found legacy token.");
                    if (mounted) setUser({ email: 'user@example.com' });
                } else {
                    // Check Supabase Session
                    console.log("AuthContext: Checking Supabase session...");
                    const { data: { session } } = await supabase.auth.getSession();
                    console.log("AuthContext: Session result:", session);

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
                clearTimeout(safetyTimer);
                // CRITICAL FIX: If this is a redirect back from Google (has hash), 
                // DO NOT set loading to false yet. Let onAuthStateChange handle it.
                // Otherwise, ProtectedRoute will redirect to Login and clear the hash before Supabase sees it.
                const isHashRedirect = window.location.hash && (
                    window.location.hash.includes('access_token') ||
                    window.location.hash.includes('error_description') ||
                    window.location.hash.includes('type=recovery')
                );

                if (mounted && !isHashRedirect) {
                    console.log("AuthContext: Auth check finished. Setting loading false.");
                    setLoading(false);
                } else if (isHashRedirect) {
                    console.log("AuthContext: Detected OAuth Hash. Waiting for onAuthStateChange...");
                }
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

                // CRITICAL SYNC: Make Supabase token available to api.js
                if (session.access_token) {
                    console.log("AuthContext: Syncing Supabase token to localStorage");
                    localStorage.setItem('token', session.access_token);
                }

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
                // CRITICAL FIX: Even if session is null, if there is a hash, IGNORE THIS.
                // Wait for the actual SIGNED_IN event which comes next.
                const isHashRedirect = window.location.hash && (
                    window.location.hash.includes('access_token') ||
                    window.location.hash.includes('error_description') ||
                    window.location.hash.includes('type=recovery')
                );

                if (!isHashRedirect) {
                    setUser(null);
                    setLoading(false);
                } else {
                    console.log("AuthContext (Listener): Hash detected with null session. Waiting...");
                }
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
