import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface EscalationAlertProps {
    count: number;
    onViewClick?: () => void;
    onDismiss?: () => void;
}

const EscalationAlert: React.FC<EscalationAlertProps> = ({ count, onViewClick, onDismiss }) => {
    if (count === 0) return null;

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-2xl p-5 mb-6 shadow-sm"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                    <div className="bg-red-500 p-2 rounded-xl shrink-0">
                        <AlertTriangle className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-900 mb-1">
                            {count} Incident{count > 1 ? 's' : ''} Require Immediate Attention
                        </h3>
                        <p className="text-sm text-red-700 flex items-center gap-2">
                            <Clock size={14} />
                            Delayed more than 24 hours without action
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 shrink-0">
                    {onViewClick && (
                        <button
                            onClick={onViewClick}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            View Escalated
                            <ArrowRight size={16} />
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="px-4 py-2 border-2 border-red-200 text-red-700 rounded-xl font-semibold text-sm hover:border-red-300 transition-colors"
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default EscalationAlert;
