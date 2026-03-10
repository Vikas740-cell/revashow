import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="text-red-600 animate-spin mb-4" size={48} />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Verifying Credentials...</p>
            </div>
        );
    }

    if (!user) {
        // Redirect to login if NOT authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to home if authenticated but NOT authorized for this role
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
