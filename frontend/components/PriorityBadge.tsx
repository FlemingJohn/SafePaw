import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface PriorityBadgeProps {
    priority: number; // 1-10
    urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
    priority,
    urgencyLevel,
    size = 'md',
    showLabel = true
}) => {
    // Determine color based on priority
    const getColorClasses = () => {
        if (priority >= 9) return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            border: 'border-red-300',
            icon: 'text-red-600'
        };
        if (priority >= 7) return {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            border: 'border-orange-300',
            icon: 'text-orange-600'
        };
        if (priority >= 4) return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            border: 'border-yellow-300',
            icon: 'text-yellow-600'
        };
        return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            border: 'border-green-300',
            icon: 'text-green-600'
        };
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-2 py-1 text-xs';
            case 'lg':
                return 'px-4 py-2 text-base';
            default:
                return 'px-3 py-1.5 text-sm';
        }
    };

    const getUrgencyLabel = () => {
        if (urgencyLevel) return urgencyLevel.toUpperCase();
        if (priority >= 9) return 'CRITICAL';
        if (priority >= 7) return 'HIGH';
        if (priority >= 4) return 'MEDIUM';
        return 'LOW';
    };

    const colors = getColorClasses();
    const sizeClasses = getSizeClasses();

    return (
        <div className={`inline-flex items-center gap-2 ${colors.bg} ${colors.text} ${sizeClasses} rounded-full font-bold border-2 ${colors.border}`}>
            {priority >= 7 && <AlertCircle size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} className={colors.icon} />}
            <span>Priority {priority}/10</span>
            {showLabel && (
                <>
                    <span className="opacity-40">•</span>
                    <span>{getUrgencyLabel()}</span>
                </>
            )}
        </div>
    );
};

export default PriorityBadge;
