import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <div className="text-center px-4">
                <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
                <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>
                <Link to="/">
                    <Button size="lg">
                        <Home className="mr-2 h-5 w-5" />
                        Go Home
                    </Button>
                </Link>
            </div>
        </div>
    );
};
