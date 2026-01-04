import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
    }

    // CRITICAL FIX: If we have an OAuth hash, DO NOT redirect yet. 
    // Wait for Supabase to parse it.
    const isHashRedirect = window.location.hash && (
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('error_description') ||
        window.location.hash.includes('type=recovery')
    );

    if (isHashRedirect) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Verifying Login...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
