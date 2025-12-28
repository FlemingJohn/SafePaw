import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    AlertCircle,
    Lightbulb,
    MapPin,
    Activity,
    Phone,
    ExternalLink,
    Sparkles
} from 'lucide-react';
import type { AISuggestion } from '../types/suggestion.types';

interface AIRealtimeSuggestionsProps {
    suggestions: AISuggestion[];
    loading?: boolean;
}

const AIRealtimeSuggestions: React.FC<AIRealtimeSuggestionsProps> = ({ suggestions, loading }) => {
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-6"
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles className="text-purple-600" size={20} />
                    </motion.div>
                    <p className="text-sm font-semibold text-purple-700">AI is analyzing your report...</p>
                </div>
            </motion.div>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-3"
        >
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-purple-600" size={20} />
                <h3 className="font-bold text-[#2D2424]">AI Suggestions</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                    {suggestions.length} {suggestions.length === 1 ? 'tip' : 'tips'}
                </span>
            </div>

            <AnimatePresence>
                {suggestions.map((suggestion, index) => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} index={index} />
                ))}
            </AnimatePresence>
        </motion.div>
    );
};

const SuggestionCard: React.FC<{ suggestion: AISuggestion; index: number }> = ({ suggestion, index }) => {
    const getIcon = () => {
        switch (suggestion.type) {
            case 'safety':
                return <AlertTriangle size={20} />;
            case 'priority':
                return <AlertCircle size={20} />;
            case 'resource':
                return <MapPin size={20} />;
            case 'similar':
                return <Activity size={20} />;
            case 'guidance':
                return <Lightbulb size={20} />;
            default:
                return <Sparkles size={20} />;
        }
    };

    const getColorClasses = () => {
        if (suggestion.priority === 'critical') {
            return {
                bg: 'bg-red-50',
                border: 'border-red-300',
                text: 'text-red-700',
                icon: 'text-red-600',
                badge: 'bg-red-100 text-red-700'
            };
        } else if (suggestion.priority === 'high') {
            return {
                bg: 'bg-orange-50',
                border: 'border-orange-300',
                text: 'text-orange-700',
                icon: 'text-orange-600',
                badge: 'bg-orange-100 text-orange-700'
            };
        } else if (suggestion.priority === 'medium') {
            return {
                bg: 'bg-blue-50',
                border: 'border-blue-300',
                text: 'text-blue-700',
                icon: 'text-blue-600',
                badge: 'bg-blue-100 text-blue-700'
            };
        } else {
            return {
                bg: 'bg-gray-50',
                border: 'border-gray-300',
                text: 'text-gray-700',
                icon: 'text-gray-600',
                badge: 'bg-gray-100 text-gray-700'
            };
        }
    };

    const colors = getColorClasses();

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            className={`${colors.bg} border ${colors.border} rounded-xl p-4`}
        >
            <div className="flex items-start gap-3">
                <div className={`${colors.icon} mt-0.5 flex-shrink-0`}>
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className={`font-bold text-sm ${colors.text}`}>
                            {suggestion.title}
                        </h4>
                        {suggestion.priority === 'critical' && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge} uppercase tracking-wider`}>
                                Urgent
                            </span>
                        )}
                    </div>
                    <p className={`text-sm ${colors.text} leading-relaxed`}>
                        {suggestion.message}
                    </p>

                    {suggestion.actionable && suggestion.action && (
                        <div className="mt-3">
                            {suggestion.action.phone ? (
                                <a
                                    href={`tel:${suggestion.action.phone}`}
                                    className={`inline-flex items-center gap-2 text-sm font-semibold ${colors.text} hover:underline`}
                                >
                                    <Phone size={16} />
                                    {suggestion.action.label}
                                </a>
                            ) : suggestion.action.url ? (
                                <a
                                    href={suggestion.action.url}
                                    className={`inline-flex items-center gap-2 text-sm font-semibold ${colors.text} hover:underline`}
                                >
                                    <ExternalLink size={16} />
                                    {suggestion.action.label}
                                </a>
                            ) : (
                                <button
                                    className={`inline-flex items-center gap-2 text-sm font-semibold ${colors.text} hover:underline`}
                                >
                                    {suggestion.action.label}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AIRealtimeSuggestions;
