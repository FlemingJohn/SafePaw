
import React, { useState } from 'react';
import {
  Home,
  MapPin,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  Plus,
  Bell,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  Scale,
  BookOpen,
  FileCheck,
  Shield,
  TrendingUp,
  Phone,
  Navigation,
  Camera,
  Map
} from 'lucide-react';
import { motion } from 'framer-motion';
import MapComponent from './MapComponent';

interface DashboardProps {
  onExit: () => void;
}

type Page = 'home' | 'report' | 'heatmap' | 'emergency' | 'myreports' | 'legal';

const Dashboard: React.FC<DashboardProps> = ({ onExit }) => {
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
          <span className="text-2xl font-bold tracking-tight">SafePaw</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem
            icon={<Home size={20} />}
            label="Overview"
            active={currentPage === 'home'}
            onClick={() => setCurrentPage('home')}
          />
          <SidebarItem
            icon={<Plus size={20} />}
            label="Report Incident"
            active={currentPage === 'report'}
            onClick={() => setCurrentPage('report')}
          />
          <SidebarItem
            icon={<Map size={20} />}
            label="Risk Heatmap"
            active={currentPage === 'heatmap'}
            onClick={() => setCurrentPage('heatmap')}
          />
          <SidebarItem
            icon={<AlertTriangle size={20} />}
            label="Emergency Help"
            active={currentPage === 'emergency'}
            onClick={() => setCurrentPage('emergency')}
          />
          <SidebarItem
            icon={<Scale size={20} />}
            label="Legal Aid"
            active={currentPage === 'legal'}
            onClick={() => setCurrentPage('legal')}
          />
          <SidebarItem
            icon={<FileText size={20} />}
            label="My Reports"
            active={currentPage === 'myreports'}
            onClick={() => setCurrentPage('myreports')}
            badge="3"
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
            <span className="font-bold text-lg">SafePaw</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-[#2D2424]/60" />
            <div className="w-8 h-8 rounded-full bg-[#E9C46A] border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold">
              U
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
          {currentPage === 'report' && <ReportPage />}
          {currentPage === 'heatmap' && <HeatmapPage />}
          {currentPage === 'emergency' && <EmergencyPage />}
          {currentPage === 'myreports' && <MyReportsPage />}
          {currentPage === 'legal' && <LegalPage />}
        </motion.main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <MobileNavItem
          icon={<Home size={22} />}
          active={currentPage === 'home'}
          onClick={() => setCurrentPage('home')}
        />
        <MobileNavItem
          icon={<Map size={22} />}
          active={currentPage === 'heatmap'}
          onClick={() => setCurrentPage('heatmap')}
        />
        <div className="relative -top-6">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => setCurrentPage('report')}
            className="bg-[#8B4513] text-white p-4 rounded-full shadow-xl shadow-orange-900/30 active:scale-90 transition-transform"
          >
            <Plus size={24} />
          </motion.button>
        </div>
        <MobileNavItem
          icon={<AlertTriangle size={22} />}
          active={currentPage === 'emergency'}
          onClick={() => setCurrentPage('emergency')}
        />
        <MobileNavItem
          icon={<FileText size={22} />}
          active={currentPage === 'myreports'}
          onClick={() => setCurrentPage('myreports')}
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
      <motion.header variants={itemVariants} className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-[#2D2424] mb-2">Welcome back, Citizen!</h1>
          <p className="text-[#2D2424]/60">Help us create safer communities together.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#8B4513] text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-orange-900/20 flex items-center gap-2"
        >
          <Plus size={20} />
          Quick Report
        </motion.button>
      </motion.header>

      <motion.div variants={itemVariants} className="md:hidden mb-8">
        <h1 className="text-2xl font-bold text-[#2D2424] mb-1">Hi, Citizen! 👋</h1>
        <p className="text-sm text-[#2D2424]/60">Stay safe, stay informed.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
        <motion.div variants={itemVariants}>
          <StatCard
            title="Your Reports"
            value="3"
            subtitle="2 resolved"
            icon={<FileText className="text-[#8B4513]" />}
            color="bg-[#E9C46A]/20"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Area Safety"
            value="Safe"
            subtitle="0 incidents this week"
            icon={<CheckCircle2 className="text-[#8AB17D]" />}
            color="bg-[#8AB17D]/20"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
          <StatCard
            title="Nearby Alerts"
            value="2"
            subtitle="Within 2km"
            icon={<AlertTriangle className="text-[#BC6C25]" />}
            color="bg-[#BC6C25]/20"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-10 md:space-y-12">
          <motion.section variants={itemVariants}>
            <h2 className="text-xl md:text-2xl font-bold text-[#2D2424] mb-6">Recent Activity</h2>
            <div className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
              <ActivityItem
                date="Dec 23"
                title="Report Submitted"
                description="Your incident report #1234 has been received and is under review."
                status="Pending"
              />
              <ActivityItem
                date="Dec 20"
                title="Action Taken"
                description="Municipal authorities acted on report #1122. Area sterilization completed."
                status="Resolved"
              />
              <ActivityItem
                date="Dec 18"
                title="Safety Alert"
                description="New incident reported 500m from your location."
                status="Alert"
                isLast
              />
            </div>
          </motion.section>
        </div>

        <motion.div variants={itemVariants}>
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-[#2D2424] mb-6">Quick Actions</h2>
            <div className="flex flex-col gap-4">
              <QuickActionCard
                icon={<Plus size={20} />}
                title="Report Incident"
                description="Quick 30-second reporting"
                color="bg-[#8B4513]"
              />
              <QuickActionCard
                icon={<Map size={20} />}
                title="Check Risk Zones"
                description="View live heatmap"
                color="bg-[#8AB17D]"
              />
              <QuickActionCard
                icon={<Phone size={20} />}
                title="Emergency Help"
                description="Find nearest hospital"
                color="bg-[#BC6C25]"
              />
            </div>
          </section>
        </motion.div>
      </div>
    </>
  );
};

// REPORT PAGE
const ReportPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424] mb-4">Report Incident</h1>
      <p className="text-[#2D2424]/60 mb-8">Help us track and prevent dog bite incidents in your area.</p>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-[#2D2424] mb-2">Location</label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Auto-detected: Current Location"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
            />
            <button className="bg-[#8B4513] text-white px-4 rounded-xl hover:bg-[#6D3610] transition-colors">
              <Navigation size={20} />
            </button>
          </div>
        </div>

        {/* Dog Type */}
        <div>
          <label className="block text-sm font-semibold text-[#2D2424] mb-3">Dog Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button className="border-2 border-[#8B4513] bg-[#8B4513]/10 text-[#8B4513] font-semibold py-3 rounded-xl hover:bg-[#8B4513]/20 transition-colors">
              Stray Dog
            </button>
            <button className="border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:border-gray-300 transition-colors">
              Pet Dog
            </button>
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-semibold text-[#2D2424] mb-3">Severity Level</label>
          <div className="grid grid-cols-3 gap-3">
            <button className="border-2 border-gray-200 text-gray-600 py-3 rounded-xl hover:border-[#8AB17D] hover:text-[#8AB17D] transition-colors">
              <div className="text-2xl mb-1">😊</div>
              <div className="text-xs font-semibold">Minor</div>
            </button>
            <button className="border-2 border-[#E9C46A] bg-[#E9C46A]/10 text-[#BC6C25] py-3 rounded-xl">
              <div className="text-2xl mb-1">😟</div>
              <div className="text-xs font-semibold">Moderate</div>
            </button>
            <button className="border-2 border-gray-200 text-gray-600 py-3 rounded-xl hover:border-red-400 hover:text-red-600 transition-colors">
              <div className="text-2xl mb-1">😰</div>
              <div className="text-xs font-semibold">Severe</div>
            </button>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-[#2D2424] mb-3">Add Photo (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#8B4513] transition-colors cursor-pointer">
            <Camera size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-[#2D2424] mb-2">Description (Optional)</label>
          <textarea
            rows={4}
            placeholder="Provide any additional details..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
          />
        </div>

        {/* Submit Button */}
        <button className="w-full bg-[#8B4513] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-900/20 hover:bg-[#6D3610] transition-colors">
          Submit Report
        </button>
      </div>
    </div>
  );
};

// HEATMAP PAGE
const HeatmapPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424] mb-4">Risk Heatmap</h1>
      <p className="text-[#2D2424]/60 mb-8">Check risk zones before traveling. Stay informed, stay safe.</p>

      {/* Interactive Map */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
        <div className="h-96 md:h-[500px]">
          <MapComponent />
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <h3 className="font-bold text-[#2D2424]">High Risk</h3>
          </div>
          <p className="text-sm text-[#2D2424]/60">5+ incidents in last 30 days</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <h3 className="font-bold text-[#2D2424]">Medium Risk</h3>
          </div>
          <p className="text-sm text-[#2D2424]/60">2-4 incidents in last 30 days</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <h3 className="font-bold text-[#2D2424]">Safe Zone</h3>
          </div>
          <p className="text-sm text-[#2D2424]/60">0-1 incidents in last 30 days</p>
        </div>
      </div>
    </div>
  );
};

// EMERGENCY PAGE
const EmergencyPage: React.FC = () => {
  return (
    <div>
      <div className="bg-[#BC6C25] text-white rounded-3xl p-6 md:p-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">🚨 Emergency Help</h1>
        <p className="text-white/90">Immediate assistance for dog bite incidents</p>
      </div>

      {/* First Aid Steps */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-2xl font-bold text-[#2D2424] mb-6">First Aid Steps</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="bg-[#8B4513] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h3 className="font-bold text-[#2D2424] mb-1">Wash the wound immediately</h3>
              <p className="text-sm text-[#2D2424]/60">Use soap and running water for 10-15 minutes</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#8B4513] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <h3 className="font-bold text-[#2D2424] mb-1">Apply antiseptic</h3>
              <p className="text-sm text-[#2D2424]/60">Use povidone-iodine or alcohol-based solution</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#8B4513] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <h3 className="font-bold text-[#2D2424] mb-1">Go to hospital NOW</h3>
              <p className="text-sm text-[#2D2424]/60">Get rabies vaccine within 24 hours - this is critical!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nearest Hospitals */}
      <h2 className="text-2xl font-bold text-[#2D2424] mb-6">Nearest Hospitals</h2>
      <div className="space-y-4">
        <HospitalCard
          name="City General Hospital"
          distance="1.2 km"
          vaccineAvailable={true}
          phone="+91 98765 43210"
        />
        <HospitalCard
          name="SafeCare Medical Center"
          distance="2.5 km"
          vaccineAvailable={true}
          phone="+91 98765 43211"
        />
        <HospitalCard
          name="Metro Health Clinic"
          distance="3.8 km"
          vaccineAvailable={false}
          phone="+91 98765 43212"
        />
      </div>
    </div>
  );
};

// MY REPORTS PAGE
const MyReportsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424] mb-4">My Reports</h1>
      <p className="text-[#2D2424]/60 mb-8">Track the status of your incident reports.</p>

      <div className="space-y-4">
        <ReportCard
          id="#1234"
          date="Dec 23, 2024"
          location="MG Road, Bangalore"
          status="Under Review"
          severity="Moderate"
        />
        <ReportCard
          id="#1122"
          date="Dec 20, 2024"
          location="Koramangala 5th Block"
          status="Action Taken"
          severity="Minor"
        />
        <ReportCard
          id="#1089"
          date="Dec 18, 2024"
          location="Indiranagar"
          status="Resolved"
          severity="Moderate"
        />
      </div>
    </div>
  );
};

// LEGAL AID PAGE
const LegalPage: React.FC = () => {
  const [medicalExpense, setMedicalExpense] = useState('');
  const [severity, setSeverity] = useState<'Minor' | 'Moderate' | 'Severe'>('Moderate');

  const calculateCompensation = () => {
    const expense = parseInt(medicalExpense) || 0;
    const baseCompensation = severity === 'Severe' ? 100000 : severity === 'Moderate' ? 50000 : 25000;
    return baseCompensation + expense;
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-[#2D2424] mb-4">Legal Aid & Compensation</h1>
      <p className="text-[#2D2424]/60 mb-8">Know your rights and get the help you deserve</p>

      {/* Compensation Calculator */}
      <div className="bg-gradient-to-br from-[#8B4513]/10 to-[#E9C46A]/10 rounded-3xl p-6 md:p-8 mb-8 border-2 border-[#8B4513]/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#8B4513] p-3 rounded-xl">
            <Scale size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2D2424]">Compensation Calculator</h2>
            <p className="text-sm text-[#2D2424]/60">Estimate your eligible compensation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-[#2D2424] mb-2">Injury Severity</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSeverity('Minor')}
                className={`py-3 rounded-xl font-semibold text-sm transition-colors ${severity === 'Minor' ? 'bg-[#8AB17D] text-white' : 'bg-white border-2 border-gray-200'}`}
              >
                Minor
              </button>
              <button
                onClick={() => setSeverity('Moderate')}
                className={`py-3 rounded-xl font-semibold text-sm transition-colors ${severity === 'Moderate' ? 'bg-[#E9C46A] text-[#2D2424]' : 'bg-white border-2 border-gray-200'}`}
              >
                Moderate
              </button>
              <button
                onClick={() => setSeverity('Severe')}
                className={`py-3 rounded-xl font-semibold text-sm transition-colors ${severity === 'Severe' ? 'bg-red-500 text-white' : 'bg-white border-2 border-gray-200'}`}
              >
                Severe
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2D2424] mb-2">Medical Expenses (₹)</label>
            <input
              type="number"
              value={medicalExpense}
              onChange={(e) => setMedicalExpense(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <p className="text-sm text-[#2D2424]/60 mb-2">Estimated Compensation</p>
          <p className="text-4xl font-bold text-[#8B4513] mb-4">₹{calculateCompensation().toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#2D2424]/60">
            * This is an estimate. Actual compensation depends on case specifics and court judgment.
          </p>
        </div>
      </div>

      {/* Your Rights */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-[#2D2424] mb-6">Your Rights as a Victim</h2>
        <div className="space-y-4">
          <RightCard
            icon={<FileCheck size={20} />}
            title="Right to Compensation"
            description="You can claim compensation from pet owners (IPC 289) or Municipal Corporation for stray dog bites."
          />
          <RightCard
            icon={<Shield size={20} />}
            title="Free Medical Treatment"
            description="Government hospitals must provide FREE anti-rabies vaccine and immunoglobulin under National Rabies Control Programme."
          />
          <RightCard
            icon={<BookOpen size={20} />}
            title="Legal Recourse"
            description="File FIR under IPC 289, 337, 338. Sue for negligence. Municipal corporations are liable for ABC program failures."
          />
        </div>
      </div>

      {/* Required Documents */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-[#2D2424] mb-6">Documents Needed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocumentItem text="Medical reports and bills" />
          <DocumentItem text="FIR copy from police station" />
          <DocumentItem text="Photos of injury" />
          <DocumentItem text="Witness statements (if any)" />
          <DocumentItem text="Vaccination records" />
          <DocumentItem text="Identity proof" />
        </div>
      </div>


    </div>
  );
};

// HELPER COMPONENTS

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
      <span className="font-medium">{label}</span>
    </div>
    {badge && <span className="bg-[#E9C46A] text-[#2D2424] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
  </motion.button>
);

const MobileNavItem: React.FC<{ icon: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-2 transition-colors ${active ? 'text-[#8B4513]' : 'text-gray-300'}`}>
    {icon}
  </button>
);

const StatCard: React.FC<{ title: string; value: string; subtitle: string; icon: React.ReactNode; color: string; className?: string }> = ({
  title, value, subtitle, icon, color, className = ""
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 flex items-start justify-between ${className} group cursor-default`}
  >
    <div>
      <p className="text-[10px] md:text-sm font-medium text-[#2D2424]/40 uppercase tracking-wider mb-2">{title}</p>
      <p className="text-2xl md:text-3xl font-bold text-[#2D2424] mb-1">{value}</p>
      <p className="text-[10px] md:text-xs text-[#2D2424]/60">{subtitle}</p>
    </div>
    <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
  </motion.div>
);

const ActivityItem: React.FC<{ date: string; title: string; description: string; status: string; isLast?: boolean }> = ({
  date, title, description, status, isLast
}) => (
  <div className={`flex gap-4 md:gap-6 ${isLast ? '' : 'pb-6 md:pb-8'}`}>
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#8B4513] mt-2"
      />
      {!isLast && <div className="w-[1px] flex-1 bg-gray-100 my-2"></div>}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-bold text-[#2D2424] text-sm md:text-base">{title}</h4>
        <span className="text-[10px] md:text-xs font-medium text-gray-400">{date}</span>
      </div>
      <p className="text-xs md:text-sm text-[#2D2424]/60 mb-2 leading-relaxed">{description}</p>
      <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest 
        ${status === 'Resolved' ? 'bg-[#8AB17D]/10 text-[#8AB17D]' :
          status === 'Alert' ? 'bg-[#E9C46A]/10 text-[#BC6C25]' : 'bg-gray-100 text-gray-400'}`}>
        {status}
      </span>
    </div>
  </div>
);

const QuickActionCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string }> = ({
  icon, title, description, color
}) => (
  <motion.div
    whileHover={{ x: 5 }}
    className={`${color} text-white p-5 rounded-2xl shadow-lg cursor-pointer`}
  >
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <h3 className="font-bold">{title}</h3>
    </div>
    <p className="text-sm text-white/80">{description}</p>
  </motion.div>
);

const HospitalCard: React.FC<{ name: string; distance: string; vaccineAvailable: boolean; phone: string }> = ({
  name, distance, vaccineAvailable, phone
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold text-lg text-[#2D2424] mb-1">{name}</h3>
        <p className="text-sm text-[#2D2424]/60">{distance} away</p>
      </div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${vaccineAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {vaccineAvailable ? '✓ Vaccine Available' : '✗ No Vaccine'}
      </span>
    </div>
    <div className="flex gap-3">
      <button className="flex-1 bg-[#8B4513] text-white py-3 rounded-xl font-semibold hover:bg-[#6D3610] transition-colors flex items-center justify-center gap-2">
        <Phone size={18} />
        Call Now
      </button>
      <button className="flex-1 border-2 border-[#8B4513] text-[#8B4513] py-3 rounded-xl font-semibold hover:bg-[#8B4513]/10 transition-colors flex items-center justify-center gap-2">
        <Navigation size={18} />
        Navigate
      </button>
    </div>
  </div>
);

const ReportCard: React.FC<{ id: string; date: string; location: string; status: string; severity: string }> = ({
  id, date, location, status, severity
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-bold text-lg text-[#2D2424]">Report {id}</h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${status === 'Resolved' ? 'bg-green-100 text-green-700' :
            status === 'Action Taken' ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-[#2D2424]/60 mb-1">{location}</p>
        <p className="text-xs text-[#2D2424]/40">{date}</p>
      </div>
      <span className="text-sm font-semibold text-[#BC6C25]">{severity}</span>
    </div>
    <button className="text-[#8B4513] font-semibold text-sm hover:underline flex items-center gap-1">
      View Details <ChevronRight size={16} />
    </button>
  </div>
);

// Legal Aid Helper Components
const RightCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
    <div className="text-[#8B4513] mt-1">{icon}</div>
    <div>
      <h3 className="font-bold text-[#2D2424] mb-1">{title}</h3>
      <p className="text-sm text-[#2D2424]/70">{description}</p>
    </div>
  </div>
);

const DocumentItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
    <CheckCircle2 size={18} className="text-[#8AB17D]" />
    <span className="text-sm font-medium text-[#2D2424]">{text}</span>
  </div>
);

const LawyerCard: React.FC<{ name: string; experience: string; specialization: string; location: string; cases: string }> = ({
  name, experience, specialization, location, cases
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-bold text-[#2D2424] mb-1">{name}</h3>
        <p className="text-sm text-[#2D2424]/60">{specialization}</p>
      </div>
      <span className="bg-[#E9C46A]/20 text-[#8B4513] text-xs font-bold px-3 py-1 rounded-full">
        {experience}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-xs text-[#2D2424]/60 mb-1">Location</p>
        <p className="text-sm font-semibold">{location}</p>
      </div>
      <div>
        <p className="text-xs text-[#2D2424]/60 mb-1">Experience</p>
        <p className="text-sm font-semibold">{cases}</p>
      </div>
    </div>
    <button className="w-full bg-[#8B4513] text-white py-3 rounded-xl font-semibold hover:bg-[#6D3610] transition-colors">
      Contact Lawyer
    </button>
  </div>
);

export default Dashboard;
