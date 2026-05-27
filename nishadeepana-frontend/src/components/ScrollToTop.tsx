import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Automatically scrolls to top on every page/route change.
// No button needed — this runs silently in the background.
export const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);
    return null;
};
