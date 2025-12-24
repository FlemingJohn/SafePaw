import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Bot,
    Brain,
    Zap,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    TrendingUp,
    Activity,
    Target,
    Briefcase,
    Shield
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AIRecommendation } from '../services/incidentService';

// Agent information
const AGENTS = [
    {
        id: 'priority',
        name: 'Priority Analyzer',
        icon: Target,
        color: '#8B4513',
        bgColor: '#E9C46A20',
        description: 'Calculates incident priority (1-10 scale) based on severity, location risk, time urgency, and resource availability',
        capabilities: [
            'Severity assessment',
            'Location risk analysis',
            'Time urgency calculation',
            'Resource availability check'
        ]
    },
    {
        id: 'action',
        name: 'Action Coordinator',
        icon: Briefcase,
        color: '#BC6C25',
        bgColor: '#BC6C2520',
        description: 'Recommends specific government actions based on incident severity and priority level',
        capabilities: [
            'Emergency rescue dispatch',
            'Hospital alerts',
            'Animal control coordination',
            'Shelter availability checks'
        ]
    },
    {
        id: 'resource',
        name: 'Resource Manager',
        icon: Users,
        color: '#8AB17D',
        bgColor: '#8AB17D20',
        description: 'Allocates available government resources including rescue teams, veterinarians, and animal control units',
        capabilities: [
            'Rescue team assignment',
            'Veterinarian allocation',
            'Animal control dispatch',
            'Distance optimization'
        ]
    },
    {
        id: 'escalation',
        name: 'Escalation Monitor',
        icon: AlertTriangle,
        color: '#d32f2f',
        bgColor: '#d32f2f20',
        description: 'Monitors incidents for delays >24 hours and triggers automatic escalation with government contact',
        capabilities: [
            'Delay detection',
            'Automatic escalation',
            'SMS/Email notifications',
            'Agent contact management'
        ]
    }
];

interface ActionHistory {
    id: string;
    incidentId: string;
    agentType: string;
    action: string;
    status: string;
    timestamp: Date;
    confidence?: number;
}

const AIActionsPage: React.FC = () => {
    const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
    const [stats, setStats] = useState({
        totalActions: 0,
        approvedActions: 0,
        overriddenActions: 0,
        pendingActions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActionHistory();
    }, []);

    const loadActionHistory = async () => {
        try {
            setLoading(true);

            // Fetch recent incidents with AI recommendations
            const q = query(
                collection(db, 'incidents'),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            const snapshot = await getDocs(q);
            const actions: ActionHistory[] = [];
            let approved = 0, overridden = 0, pending = 0;

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.aiRecommendations && Array.isArray(data.aiRecommendations)) {
                    data.aiRecommendations.forEach((rec: any) => {
                        actions.push({
                            id: rec.id || `${doc.id}_${rec.agentType}`,
                            incidentId: doc.id,
                            agentType: rec.agentType,
                            action: rec.recommendation,
                            status: rec.status || 'pending',
                            timestamp: rec.timestamp?.toDate() || new Date(),
                            confidence: rec.confidence
                        });

                        // Count statuses
                        if (rec.status === 'approved' || rec.status === 'executed') approved++;
                        else if (rec.status === 'overridden') overridden++;
                        else pending++;
                    });
                }
            });

            setActionHistory(actions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
            setStats({
                totalActions: actions.length,
                approvedActions: approved,
                overriddenActions: overridden,
                pendingActions: pending
            });
        } catch (error) {
            console.error('Error loading action history:', error);
        } finally {
            setLoading(false);
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div>
            <motion.header variants={itemVariants} className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-[#8B4513] p-2 rounded-xl">
                        <Bot className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424]">AI Actions</h1>
                </div>
                <p className="text-[#2D2424]/60">Multi-agent system for intelligent incident management</p>
            </motion.header>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Actions"
                    value={stats.totalActions}
                    icon={<Activity className="text-[#8B4513]" />}
                    color="bg-[#E9C46A]/20"
                />
                <StatCard
                    title="Approved"
                    value={stats.approvedActions}
                    icon={<CheckCircle2 className="text-[#8AB17D]" />}
                    color="bg-[#8AB17D]/20"
                />
                <StatCard
                    title="Overridden"
                    value={stats.overriddenActions}
                    icon={<XCircle className="text-[#BC6C25]" />}
                    color="bg-[#BC6C25]/20"
                />
                <StatCard
                    title="Pending"
                    value={stats.pendingActions}
                    icon={<Clock className="text-[#8B4513]" />}
                    color="bg-[#8B4513]/20"
                />
            </div>

            {/* AI Agents */}
            <h2 className="text-2xl font-bold text-[#2D2424] mb-6">AI Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {AGENTS.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                ))}
            </div>

            {/* Action History */}
            <h2 className="text-2xl font-bold text-[#2D2424] mb-6">Action History</h2>
            {loading ? (
                <div className="bg-white rounded-3xl p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-[#8B4513] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-[#2D2424]/60">Loading action history...</p>
                </div>
            ) : actionHistory.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center">
                    <Bot className="w-16 h-16 text-[#2D2424]/20 mx-auto mb-4" />
                    <p className="text-[#2D2424]/60">No AI actions yet</p>
                    <p className="text-sm text-[#2D2424]/40 mt-2">Actions will appear here as incidents are processed</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {actionHistory.map((action) => (
                        <ActionHistoryCard key={action.id} action={action} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Agent Card Component
const AgentCard: React.FC<{ agent: typeof AGENTS[0] }> = ({ agent }) => {
    const Icon = agent.icon;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
            <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-2xl`} style={{ backgroundColor: agent.bgColor }}>
                    <Icon size={24} style={{ color: agent.color }} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#2D2424] mb-1">{agent.name}</h3>
                    <p className="text-sm text-[#2D2424]/60">{agent.description}</p>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-xs font-semibold text-[#2D2424]/40 uppercase tracking-wider">Capabilities</p>
                <ul className="space-y-1">
                    {agent.capabilities.map((capability, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-[#2D2424]/70">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }}></div>
                            {capability}
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}> = ({ title, value, icon, color }) => (
    <motion.div
        whileHover={{ y: -3 }}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
    >
        <div className={`p-2.5 rounded-xl ${color} w-fit mb-3`}>
            {icon}
        </div>
        <p className="text-xs font-medium text-[#2D2424]/40 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-bold text-[#2D2424]">{value}</p>
    </motion.div>
);

// Action History Card Component
const ActionHistoryCard: React.FC<{ action: ActionHistory }> = ({ action }) => {
    const agent = AGENTS.find(a => a.id === action.agentType);
    const Icon = agent?.icon || Bot;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
            case 'executed':
                return 'bg-green-100 text-green-700';
            case 'overridden':
                return 'bg-orange-100 text-orange-700';
            case 'pending':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{ backgroundColor: agent?.bgColor || '#E9C46A20' }}
                >
                    <Icon size={20} style={{ color: agent?.color || '#8B4513' }} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-[#2D2424]">{agent?.name || 'AI Agent'}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(action.status)}`}>
                                    {action.status}
                                </span>
                            </div>
                            <p className="text-sm text-[#2D2424]/70 line-clamp-2">{action.action}</p>
                        </div>
                        {action.confidence && (
                            <div className="text-right shrink-0">
                                <p className="text-xs text-[#2D2424]/40 mb-0.5">Confidence</p>
                                <p className="text-sm font-bold text-[#8B4513]">{Math.round(action.confidence * 100)}%</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#2D2424]/40">
                        <span className="flex items-center gap-1">
                            <Shield size={12} />
                            Incident #{action.incidentId.slice(-6)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimestamp(action.timestamp)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIActionsPage;
