import React from 'react';
import { Badge } from './ui/badge';
import { BlouseType } from '../lib/types';

interface BlouseBadgeProps {
    blouseType: BlouseType;
    className?: string;
}

export const BlouseBadge: React.FC<BlouseBadgeProps> = ({ blouseType, className = '' }) => {
    const getBadgeConfig = (type: BlouseType) => {
        switch (type) {
            case 'running':
                return {
                    text: '🧵 Running Blouse',
                    variant: 'default' as const,
                    className: 'bg-maroon text-beige hover:bg-maroon-dark',
                };
            case 'contrast':
                return {
                    text: '✨ Contrast Blouse',
                    variant: 'secondary' as const,
                    className: 'bg-gold text-maroon hover:bg-gold-dark',
                };
            case 'both':
                return {
                    text: '🧵✨ Running + Contrast Blouse',
                    variant: 'default' as const,
                    className: 'bg-gradient-to-r from-maroon to-gold text-white hover:opacity-90 border-0',
                };
            case 'none':
                return {
                    text: '⚠️ No Blouse',
                    variant: 'outline' as const,
                    className: 'border-gray-400 text-gray-600',
                };
            default:
                return {
                    text: 'Blouse Info',
                    variant: 'outline' as const,
                    className: '',
                };
        }
    };

    const config = getBadgeConfig(blouseType);

    return (
        <Badge variant={config.variant} className={`${config.className} ${className}`}>
            {config.text}
        </Badge>
    );
};
