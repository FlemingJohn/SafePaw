
import React, { useState } from 'react';
import {
    Home,
    FileText,
    BarChart3,
    Scissors,
    Settings,
    LogOut,
    Bell,
    Search,
    CheckCircle2,
    Clock,
    ChevronRight,
    Shield,
    TrendingUp,
    AlertCircle,
    Users,
    MapPin,
    Calendar,
    Filter,
    Download,
    Eye,
    Edit
} from 'lucide-react';
import { motion } from 'framer-motion';

interface GovDashboardProps {
    onExit: () => void;
}

type Page = 'home' | 'incidents' | 'abc' | 'analytics';

const GovDashboard: React.FC<GovDashboardProps> = ({ onExit }) => {
    const [currentPage, setCurrentPage] = useState<Page>('home');

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex min-h-screen bg-[#FDFBF4] overflow-hidden">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                className="hidden md:flex flex-col w-72 bg-[#2D2424] text-[#FDFBF4] p-8 shrink-0"
            >
                <div className="flex items-center gap-2 mb-12">
                    <div className="bg-[#8B4513] p-1.5 rounded-lg">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold tracking-tight block">SafePaw</span>
                        <span className="text-xs text-[#E9C46A] font-semibold">Government Portal</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem
                        icon={<Home size={20} />}
                        label="Overview"
                        active={currentPage === 'home'}
                        onClick={() => setCurrentPage('home')}
                    />
                    <SidebarItem
                        icon={<FileText size={20} />}
                        label="Incident Management"
                        active={currentPage === 'incidents'}
                        onClick={() => setCurrentPage('incidents')}
                        badge="12"
                    />
                    <SidebarItem
                        icon={<Scissors size={20} />}
                        label="ABC Program"
                        active={currentPage === 'abc'}
                        onClick={() => setCurrentPage('abc')}
                    />
                    <SidebarItem
                        icon={<BarChart3 size={20} />}
                        label="Analytics & Reports"
                        active={currentPage === 'analytics'}
                        onClick={() => setCurrentPage('analytics')}
                    />
                </nav>

                <button
                    onClick={onExit}
                    className="mt-auto flex items-center gap-3 text-[#FDFBF4]/60 hover:text-white transition-colors p-3 group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Site</span>
                </button>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen pb-24 md:pb-0 overflow-x-hidden overflow-y-auto">
                {/* Mobile Header */}
                <header className="md:hidden flex justify-between items-center p-4 border-b border-[#2D2424]/5 bg-[#FDFBF4]/80 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#2D2424] p-1 rounded-md">
                            <Shield className="text-white w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-bold text-sm">SafePaw</span>
                            <span className="text-[10px] text-[#8B4513] block font-semibold">Government</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Bell size={20} className="text-[#2D2424]/60" />
                        <div className="w-8 h-8 rounded-full bg-[#8B4513] border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-white">
                            G
                        </div>
                    </div>
                </header>

                <motion.main
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex-1 px-4 py-6 md:px-12 md:py-12"
                >
                    {currentPage === 'home' && <HomePage />}
                    {currentPage === 'incidents' && <IncidentsPage />}
                    {currentPage === 'abc' && <ABCPage />}
                    {currentPage === 'analytics' && <AnalyticsPage />}
                </motion.main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center z-40 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <MobileNavItem
                    icon={<Home size={22} />}
                    active={currentPage === 'home'}
                    onClick={() => setCurrentPage('home')}
                />
                <MobileNavItem
                    icon={<FileText size={22} />}
                    active={currentPage === 'incidents'}
                    onClick={() => setCurrentPage('incidents')}
                />
                <MobileNavItem
                    icon={<Scissors size={22} />}
                    active={currentPage === 'abc'}
                    onClick={() => setCurrentPage('abc')}
                />
                <MobileNavItem
                    icon={<BarChart3 size={22} />}
                    active={currentPage === 'analytics'}
                    onClick={() => setCurrentPage('analytics')}
                />
            </nav>
        </div>
    );
};

// HOME PAGE
const HomePage: React.FC = () => {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <>
            <motion.header variants={itemVariants} className="mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424] mb-2">Government Dashboard</h1>
                <p className="text-[#2D2424]/60">Municipal Corporation - South District</p>
            </motion.header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Total Incidents"
                        value="45"
                        change="+12% this month"
                        trend="up"
                        icon={<FileText className="text-[#8B4513]" />}
                        color="bg-[#E9C46A]/20"
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Pending Actions"
                        value="12"
                        change="Requires attention"
                        trend="neutral"
                        icon={<Clock className="text-[#BC6C25]" />}
                        color="bg-[#BC6C25]/20"
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Resolved"
                        value="28"
                        change="62% resolution rate"
                        trend="up"
                        icon={<CheckCircle2 className="text-[#8AB17D]" />}
                        color="bg-[#8AB17D]/20"
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <MetricCard
                        title="Avg Response Time"
                        value="2.4 days"
                        change="-0.5 days improved"
                        trend="down"
                        icon={<TrendingUp className="text-[#8B4513]" />}
                        color="bg-[#8B4513]/20"
                    />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                <div className="lg:col-span-2 space-y-10 md:space-y-12">
                    {/* Recent Incidents */}
                    <motion.section variants={itemVariants}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-[#2D2424]">Pending Incidents</h2>
                            <button className="text-[#8B4513] font-semibold text-sm hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            <IncidentPreviewCard
                                id="#1234"
                                location="MG Road, Sector 5"
                                severity="Moderate"
                                date="2 hours ago"
                                status="Reported"
                            />
                            <IncidentPreviewCard
                                id="#1233"
                                location="Park Street, Block A"
                                severity="Severe"
                                date="5 hours ago"
                                status="Under Review"
                            />
                            <IncidentPreviewCard
                                id="#1230"
                                location="Market Area, Zone 3"
                                severity="Minor"
                                date="1 day ago"
                                status="Reported"
                            />
                        </div>
                    </motion.section>

                    {/* ABC Program Stats */}
                    <motion.section variants={itemVariants}>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2D2424] mb-6">ABC Program Overview</h2>
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-[#2D2424]/60 mb-2">This Month</p>
                                    <p className="text-3xl font-bold text-[#2D2424]">156</p>
                                    <p className="text-xs text-[#8AB17D]">Dogs Sterilized</p>
                                </div>
                                <div>
                                    <p className="text-sm text-[#2D2424]/60 mb-2">This Year</p>
                                    <p className="text-3xl font-bold text-[#2D2424]">1,847</p>
                                    <p className="text-xs text-[#8AB17D]">Total Operations</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <section>
                        <h2 className="text-xl md:text-2xl font-bold text-[#2D2424] mb-6">Quick Actions</h2>
                        <div className="flex flex-col gap-4">
                            <ActionButton
                                icon={<Eye size={20} />}
                                title="Review Incidents"
                                description="12 pending reviews"
                            />
                            <ActionButton
                                icon={<Calendar size={20} />}
                                title="Schedule ABC Drive"
                                description="Plan sterilization"
                            />
                            <ActionButton
                                icon={<Download size={20} />}
                                title="Export Report"
                                description="Download monthly data"
                            />
                        </div>
                    </section>
                </motion.div>
            </div>
        </>
    );
};

// INCIDENTS PAGE
const IncidentsPage: React.FC = () => {
    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424] mb-2">Incident Management</h1>
                    <p className="text-[#2D2424]/60">Review and take action on reported incidents</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#8B4513] transition-colors">
                        <Filter size={18} />
                        <span className="font-semibold text-sm">Filter</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#8B4513] text-white rounded-xl hover:bg-[#6D3610] transition-colors">
                        <Download size={18} />
                        <span className="font-semibold text-sm">Export</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                <FilterChip label="All" active count={45} />
                <FilterChip label="Pending" count={12} />
                <FilterChip label="Under Review" count={5} />
                <FilterChip label="Action Taken" count={8} />
                <FilterChip label="Resolved" count={20} />
            </div>

            {/* Incident List */}
            <div className="space-y-4">
                <IncidentCard
                    id="#1234"
                    location="MG Road, Sector 5"
                    date="Dec 23, 2024 - 2:30 PM"
                    reporter="Anonymous"
                    dogType="Stray"
                    severity="Moderate"
                    status="Reported"
                    description="Dog showed aggressive behavior near school area. Multiple children present."
                />
                <IncidentCard
                    id="#1233"
                    location="Park Street, Block A"
                    date="Dec 23, 2024 - 9:15 AM"
                    reporter="Rajesh Kumar"
                    dogType="Stray"
                    severity="Severe"
                    status="Under Review"
                    description="Bite incident reported. Victim received medical attention. Pack of 3-4 dogs observed."
                />
                <IncidentCard
                    id="#1230"
                    location="Market Area, Zone 3"
                    date="Dec 22, 2024 - 4:45 PM"
                    reporter="Priya Sharma"
                    dogType="Pet"
                    severity="Minor"
                    status="Reported"
                    description="Pet dog without leash caused disturbance. Owner identified."
                />
            </div>
        </div>
    );
};

// ABC PROGRAM PAGE
const ABCPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424] mb-4">ABC Program Tracking</h1>
            <p className="text-[#2D2424]/60 mb-8">Animal Birth Control - Sterilization Statistics</p>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-2xl p-6 border-l-4 border-[#8AB17D]">
                    <p className="text-sm text-[#2D2424]/60 mb-2">This Month</p>
                    <p className="text-4xl font-bold text-[#2D2424] mb-1">156</p>
                    <p className="text-sm text-[#8AB17D]">Dogs Sterilized</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border-l-4 border-[#E9C46A]">
                    <p className="text-sm text-[#2D2424]/60 mb-2">This Year</p>
                    <p className="text-4xl font-bold text-[#2D2424] mb-1">1,847</p>
                    <p className="text-sm text-[#BC6C25]">Total Operations</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border-l-4 border-[#8B4513]">
                    <p className="text-sm text-[#2D2424]/60 mb-2">Target Progress</p>
                    <p className="text-4xl font-bold text-[#2D2424] mb-1">74%</p>
                    <p className="text-sm text-[#8B4513]">2,500 Annual Goal</p>
                </div>
            </div>

            {/* Area-wise Breakdown */}
            <h2 className="text-2xl font-bold text-[#2D2424] mb-6">Area-wise Breakdown</h2>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
                <div className="space-y-4">
                    <AreaProgressBar area="Zone 1 - North" completed={45} target={60} />
                    <AreaProgressBar area="Zone 2 - South" completed={38} target={50} />
                    <AreaProgressBar area="Zone 3 - East" completed={52} target={55} />
                    <AreaProgressBar area="Zone 4 - West" completed={21} target={45} />
                </div>
            </div>

            {/* Recent Drives */}
            <h2 className="text-2xl font-bold text-[#2D2424] mb-6">Recent Sterilization Drives</h2>
            <div className="space-y-4">
                <DriveCard
                    date="Dec 20, 2024"
                    location="Zone 1 - MG Road Area"
                    dogsCount={12}
                    status="Completed"
                    ngo="Animal Welfare Society"
                />
                <DriveCard
                    date="Dec 18, 2024"
                    location="Zone 3 - Market District"
                    dogsCount={15}
                    status="Completed"
                    ngo="Stray Care Foundation"
                />
                <DriveCard
                    date="Dec 25, 2024"
                    location="Zone 2 - Residential Area"
                    dogsCount={20}
                    status="Scheduled"
                    ngo="Pet Rescue NGO"
                />
            </div>
        </div>
    );
};

// ANALYTICS PAGE
const AnalyticsPage: React.FC = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424] mb-2">Analytics & Reports</h1>
                    <p className="text-[#2D2424]/60">Data insights and performance metrics</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-[#8B4513] text-white rounded-xl hover:bg-[#6D3610] transition-colors">
                    <Download size={18} />
                    <span className="font-semibold">Export Report</span>
                </button>
            </div>

            {/* Time Period Selector */}
            <div className="flex gap-3 mb-8">
                <button className="px-4 py-2 bg-[#8B4513] text-white rounded-xl font-semibold text-sm">Last 30 Days</button>
                <button className="px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold text-sm hover:border-[#8B4513] transition-colors">Last 3 Months</button>
                <button className="px-4 py-2 border-2 border-gray-200 rounded-xl font-semibold text-sm hover:border-[#8B4513] transition-colors">This Year</button>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#2D2424] mb-4">Incident Trends</h3>
                    <div className="bg-gradient-to-br from-[#E9C46A]/10 to-[#8B4513]/10 rounded-2xl h-64 flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 size={48} className="mx-auto text-[#8B4513] mb-2" />
                            <p className="text-sm text-[#2D2424]/60">Chart visualization</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-[#2D2424] mb-4">Response Time Analysis</h3>
                    <div className="bg-gradient-to-br from-[#8AB17D]/10 to-[#E9C46A]/10 rounded-2xl h-64 flex items-center justify-center">
                        <div className="text-center">
                            <TrendingUp size={48} className="mx-auto text-[#8AB17D] mb-2" />
                            <p className="text-sm text-[#2D2424]/60">Chart visualization</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Insights */}
            <h2 className="text-2xl font-bold text-[#2D2424] mb-6">Key Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InsightCard
                    title="Peak Incident Hours"
                    value="6 PM - 9 PM"
                    description="Most incidents occur during evening hours"
                    trend="up"
                />
                <InsightCard
                    title="High-Risk Areas"
                    value="Zone 1 & Zone 3"
                    description="Require increased ABC program focus"
                    trend="neutral"
                />
                <InsightCard
                    title="Resolution Rate"
                    value="62%"
                    description="Improved by 8% from last month"
                    trend="up"
                />
                <InsightCard
                    title="Citizen Engagement"
                    value="45 Reports"
                    description="12% increase in community participation"
                    trend="up"
                />
            </div>
        </div>
    );
};

// HELPER COMPONENTS
const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; badge?: string; onClick?: () => void }> = ({
    icon, label, active, badge, onClick
}) => (
    <motion.button
        whileHover={{ x: 5 }}
        onClick={onClick}
        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${active ? 'bg-[#8B4513] text-white shadow-lg shadow-orange-900/10' : 'text-[#FDFBF4]/60 hover:bg-white/5 hover:text-white'}`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-medium text-sm">{label}</span>
        </div>
        {badge && <span className="bg-[#E9C46A] text-[#2D2424] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
    </motion.button>
);

const MobileNavItem: React.FC<{ icon: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ icon, active, onClick }) => (
    <button onClick={onClick} className={`p-2 transition-colors ${active ? 'text-[#8B4513]' : 'text-gray-300'}`}>
        {icon}
    </button>
);

const MetricCard: React.FC<{ title: string; value: string; change: string; trend: 'up' | 'down' | 'neutral'; icon: React.ReactNode; color: string }> = ({
    title, value, change, trend, icon, color
}) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 group cursor-default"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                {change}
            </span>
        </div>
        <p className="text-[10px] md:text-sm font-medium text-[#2D2424]/40 uppercase tracking-wider mb-2">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-[#2D2424]">{value}</p>
    </motion.div>
);

const IncidentPreviewCard: React.FC<{ id: string; location: string; severity: string; date: string; status: string }> = ({
    id, location, severity, date, status
}) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-3">
            <div>
                <h3 className="font-bold text-[#2D2424] mb-1">{id}</h3>
                <p className="text-sm text-[#2D2424]/60 flex items-center gap-2">
                    <MapPin size={14} />
                    {location}
                </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${severity === 'Severe' ? 'bg-red-100 text-red-700' :
                severity === 'Moderate' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                }`}>
                {severity}
            </span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-xs text-[#2D2424]/40">{date}</span>
            <button className="text-[#8B4513] font-semibold text-sm hover:underline flex items-center gap-1">
                Review <ChevronRight size={14} />
            </button>
        </div>
    </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
    icon, title, description
}) => (
    <motion.button
        whileHover={{ x: 5 }}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-[#8B4513] transition-all text-left"
    >
        <div className="flex items-center gap-3 mb-2">
            <div className="text-[#8B4513]">{icon}</div>
            <h3 className="font-bold text-[#2D2424]">{title}</h3>
        </div>
        <p className="text-sm text-[#2D2424]/60">{description}</p>
    </motion.button>
);

const FilterChip: React.FC<{ label: string; active?: boolean; count?: number }> = ({ label, active, count }) => (
    <button className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors ${active ? 'bg-[#8B4513] text-white' : 'bg-white border-2 border-gray-200 hover:border-[#8B4513]'
        }`}>
        {label} {count !== undefined && `(${count})`}
    </button>
);

const IncidentCard: React.FC<{
    id: string;
    location: string;
    date: string;
    reporter: string;
    dogType: string;
    severity: string;
    status: string;
    description: string;
}> = ({ id, location, date, reporter, dogType, severity, status, description }) => (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-[#2D2424]">{id}</h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${status === 'Resolved' ? 'bg-green-100 text-green-700' :
                        status === 'Action Taken' ? 'bg-blue-100 text-blue-700' :
                            status === 'Under Review' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                        }`}>
                        {status}
                    </span>
                </div>
                <p className="text-sm text-[#2D2424]/60 flex items-center gap-2 mb-1">
                    <MapPin size={14} />
                    {location}
                </p>
                <p className="text-xs text-[#2D2424]/40">{date}</p>
            </div>
            <div className="flex gap-3">
                <button className="px-6 py-3 bg-[#8B4513] text-white rounded-xl font-semibold hover:bg-[#6D3610] transition-colors flex items-center gap-2">
                    <Edit size={18} />
                    Update Status
                </button>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div>
                <p className="text-xs text-[#2D2424]/60 mb-1">Reporter</p>
                <p className="font-semibold text-sm">{reporter}</p>
            </div>
            <div>
                <p className="text-xs text-[#2D2424]/60 mb-1">Dog Type</p>
                <p className="font-semibold text-sm">{dogType}</p>
            </div>
            <div>
                <p className="text-xs text-[#2D2424]/60 mb-1">Severity</p>
                <span className={`text-sm font-bold ${severity === 'Severe' ? 'text-red-600' :
                    severity === 'Moderate' ? 'text-orange-600' :
                        'text-green-600'
                    }`}>
                    {severity}
                </span>
            </div>
            <div>
                <p className="text-xs text-[#2D2424]/60 mb-1">Photos</p>
                <p className="font-semibold text-sm">2 attached</p>
            </div>
        </div>

        <div>
            <p className="text-sm font-semibold text-[#2D2424] mb-2">Description</p>
            <p className="text-sm text-[#2D2424]/70 leading-relaxed">{description}</p>
        </div>
    </div>
);

const AreaProgressBar: React.FC<{ area: string; completed: number; target: number }> = ({ area, completed, target }) => {
    const percentage = (completed / target) * 100;
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-[#2D2424]">{area}</p>
                <p className="text-sm text-[#2D2424]/60">{completed}/{target} dogs</p>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-[#8AB17D]"
                />
            </div>
        </div>
    );
};

const DriveCard: React.FC<{ date: string; location: string; dogsCount: number; status: string; ngo: string }> = ({
    date, location, dogsCount, status, ngo
}) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="font-bold text-lg text-[#2D2424] mb-1">{location}</h3>
                <p className="text-sm text-[#2D2424]/60">{date}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                {status}
            </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-xs text-[#2D2424]/60 mb-1">Dogs Count</p>
                <p className="font-bold text-2xl text-[#8B4513]">{dogsCount}</p>
            </div>
            <div>
                <p className="text-xs text-[#2D2424]/60 mb-1">NGO Partner</p>
                <p className="font-semibold text-sm">{ngo}</p>
            </div>
        </div>
    </div>
);

const InsightCard: React.FC<{ title: string; value: string; description: string; trend: 'up' | 'down' | 'neutral' }> = ({
    title, value, description, trend
}) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-[#2D2424]">{title}</h3>
            {trend === 'up' && <TrendingUp size={20} className="text-green-600" />}
            {trend === 'down' && <TrendingUp size={20} className="text-red-600 rotate-180" />}
        </div>
        <p className="text-3xl font-bold text-[#8B4513] mb-2">{value}</p>
        <p className="text-sm text-[#2D2424]/60">{description}</p>
    </div>
);

export default GovDashboard;
