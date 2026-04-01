import React, { useEffect } from 'react';

/**
 * A simple redirect component to bypass Meta's URL button restrictions
 * for WhatsApp templates. It instantly forwards the user to the Mom's WhatsApp chat.
 */
export const SupportRedirect: React.FC = () => {
    useEffect(() => {
        // Automatically redirect to Mom's WhatsApp chat
        window.location.replace('https://wa.me/919500384237');
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mb-4"></div>
            <h2 className="text-xl font-serif text-maroon mb-2">Connecting to Support...</h2>
            <p className="text-gray-600">Opening WhatsApp securely. Please wait.</p>
            <p className="text-sm text-gray-400 mt-4">
                If nothing happens, <a href="https://wa.me/919500384237" className="underline text-blue-600">click here</a>.
            </p>
        </div>
    );
};
