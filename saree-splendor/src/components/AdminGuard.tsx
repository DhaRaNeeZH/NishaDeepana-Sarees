import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminGuardProps {
    children: React.ReactNode;
}

/**
 * Protects admin routes — redirects to /admin/login if not authenticated as admin.
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const { isAdmin } = useAuth();

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};
