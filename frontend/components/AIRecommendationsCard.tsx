import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, CheckCircle2, XCircle, Clock, Target, Briefcase, Users } from 'lucide-react';
import type { AIRecommendation } from '../services/incidentService';
import { approveAIAction, overrideAIAction } from '../services/aiService';

interface AIRecommendationsCardProps {
    incidentId: string;
    recommendations: AIRecommendation[];
    onUpdate?: () => void;
}

const AIRecommendationsCard: React.FC<AIRecommendationsCardProps> = ({
    incidentId,
    recommendations,
    onUpdate
}) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [showOverrideModal, setShowOverrideModal] = useState<string | null>(null);
    const [overrideReason, setOverrideReason] = useState('');

    const getAgentIcon = (agentType: string) => {
        switch (agentType) {
            case 'priority': return Target;
            case 'action': return Briefcase;
            case 'resource': return Users;
            default: return Bot;
        }
    };

    const getAgentColor = (agentType: string) => {
        switch (agentType) {
            case 'priority': return '#8B4513';
            case 'action': return '#BC6C25';
            case 'resource': return '#8AB17D';
            default: return '#2D2424';
        }
    };

    const handleApprove = async (recommendationId: string) => {
        try {
            setLoading(recommendationId);
            await approveAIAction(incidentId, recommendationId);
            onUpdate?.();
        } catch (error) {
            console.error('Error approving action:', error);
            // SECURITY FIX: Removed alert() - using console.error instead
            // In production, use a proper toast notification library
        } finally {
            setLoading(null);
        }
    };

    const handleOverride = async (recommendationId: string) => {
        if (!overrideReason.trim()) {
            // SECURITY FIX: Better validation feedback
            console.error('Override reason is required');
            return;
        }

        try {
            setLoading(recommendationId);
            await overrideAIAction(incidentId, recommendationId, overrideReason);
            setShowOverrideModal(null);
            setOverrideReason('');
            onUpdate?.();
        } catch (error) {
            console.error('Error overriding action:', error);
            // SECURITY FIX: Removed alert() - using console.error instead
        } finally {
            setLoading(null);
        }
    };

    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#E9C46A]/20 p-2.5 rounded-xl">
                    <Bot className="text-[#8B4513] w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[#2D2424]">AI Recommendations</h3>
                    <p className="text-sm text-[#2D2424]/60">{recommendations.length} suggestions from AI agents</p>
                </div>
            </div>

            <div className="space-y-4">
                {recommendations.map((rec) => {
                    const Icon = getAgentIcon(rec.agentType);
                    const color = getAgentColor(rec.agentType);
                    const isPending = rec.status === 'pending';
                    const isApproved = rec.status === 'approved' || rec.status === 'executed';
                    const isOverridden = rec.status === 'overridden';

                    return (
                        <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-2 border-gray-100 rounded-2xl p-4"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                                    <Icon size={18} style={{ color }} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-[#2D2424]/40 uppercase">
                                            {rec.agentType} Agent
                                        </span>
                                        {rec.confidence && (
                                            <span className="text-xs text-[#8B4513] font-semibold">
                                                {Math.round(rec.confidence * 100)}% confidence
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-[#2D2424]/80">{rec.recommendation}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    {isApproved && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                                            <CheckCircle2 size={12} />
                                            Approved
                                        </span>
                                    )}
                                    {isOverridden && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                                            <XCircle size={12} />
                                            Overridden
                                        </span>
                                    )}
                                    {isPending && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                            <Clock size={12} />
                                            Pending Review
                                        </span>
                                    )}
                                </div>

                                {isPending && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(rec.id)}
                                            disabled={loading === rec.id}
                                            className="px-4 py-2 bg-[#8AB17D] text-white rounded-xl text-sm font-semibold hover:bg-[#7A9F6D] transition-colors disabled:opacity-50"
                                        >
                                            {loading === rec.id ? 'Approving...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => setShowOverrideModal(rec.id)}
                                            disabled={loading === rec.id}
                                            className="px-4 py-2 border-2 border-gray-200 text-[#2D2424] rounded-xl text-sm font-semibold hover:border-[#8B4513] transition-colors disabled:opacity-50"
                                        >
                                            Override
                                        </button>
                                    </div>
                                )}
                            </div>

                            {showOverrideModal === rec.id && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-white rounded-3xl p-6 max-w-md w-full"
                                    >
                                        <h3 className="text-xl font-bold text-[#2D2424] mb-4">Override AI Recommendation</h3>
                                        <p className="text-sm text-[#2D2424]/60 mb-4">
                                            Please provide a reason for overriding this recommendation:
                                        </p>
                                        <textarea
                                            value={overrideReason}
                                            onChange={(e) => setOverrideReason(e.target.value)}
                                            placeholder="Enter reason..."
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl resize-none focus:border-[#8B4513] outline-none mb-4"
                                            rows={4}
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleOverride(rec.id)}
                                                disabled={!overrideReason.trim() || loading === rec.id}
                                                className="flex-1 px-4 py-3 bg-[#BC6C25] text-white rounded-xl font-semibold hover:bg-[#A55E20] transition-colors disabled:opacity-50"
                                            >
                                                {loading === rec.id ? 'Overriding...' : 'Confirm Override'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowOverrideModal(null);
                                                    setOverrideReason('');
                                                }}
                                                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:border-[#8B4513] transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default AIRecommendationsCard;
