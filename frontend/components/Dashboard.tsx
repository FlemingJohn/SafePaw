
import React from 'react';
import { 
  Home, 
  Calendar, 
  Dog, 
  Settings, 
  LogOut, 
  Plus, 
  Bell, 
  Search,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  onExit: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onExit }) => {
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
            <Dog className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Studats</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<Home size={20} />} label="Overview" active />
          <SidebarItem icon={<Calendar size={20} />} label="Sessions" />
          <SidebarItem icon={<Dog size={20} />} label="My Pets" />
          <SidebarItem icon={<Bell size={20} />} label="Messages" badge="2" />
          <SidebarItem icon={<Settings size={20} />} label="Settings" />
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
              <Dog className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg">Studats</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-[#2D2424]/60" />
            <div className="w-8 h-8 rounded-full bg-[#E9C46A] border-2 border-white shadow-sm overflow-hidden">
               <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" alt="User" />
            </div>
          </div>
        </header>

        <motion.main 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 px-4 py-6 md:px-12 md:py-12"
        >
          {/* Main Header */}
          <motion.header variants={itemVariants} className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold text-[#2D2424] mb-2">Welcome back, Sarah!</h1>
              <p className="text-[#2D2424]/60">Your pack is making great progress this week.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search sessions..." 
                  className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 transition-all"
                />
              </div>
              <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-full bg-[#E9C46A] border-2 border-white shadow-sm overflow-hidden cursor-pointer">
                 <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" alt="User" />
              </motion.div>
            </div>
          </motion.header>

          <motion.div variants={itemVariants} className="md:hidden mb-8">
            <h1 className="text-2xl font-bold text-[#2D2424] mb-1">Hi, Sarah! 👋</h1>
            <p className="text-sm text-[#2D2424]/60">Your pack is looking great.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
            <motion.div variants={itemVariants}><StatCard title="Training Hours" value="12.5" subtitle="2.4h this week" icon={<Clock className="text-[#8B4513]" />} color="bg-[#E9C46A]/20" /></motion.div>
            <motion.div variants={itemVariants}><StatCard title="Skills Learned" value="8" subtitle="Mastered 'Stay'!" icon={<CheckCircle2 className="text-[#8AB17D]" />} color="bg-[#8AB17D]/20" /></motion.div>
            <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1"><StatCard title="Upcoming" value="3" subtitle="Next: Wed 3PM" icon={<Calendar className="text-[#BC6C25]" />} color="bg-[#BC6C25]/20" /></motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2 space-y-10 md:space-y-12">
              <motion.section variants={itemVariants}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-[#2D2424]">My Pets</h2>
                  <button className="text-[#8B4513] font-semibold text-sm flex items-center gap-1 hover:underline group">
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Pet
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <PetCard name="Cooper" breed="Golden Retriever" progress={85} image="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300" />
                  <PetCard name="Luna" breed="Border Collie" progress={40} image="https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=300" />
                </div>
              </motion.section>

              <motion.section variants={itemVariants}>
                <h2 className="text-xl md:text-2xl font-bold text-[#2D2424] mb-6">Progress Log</h2>
                <div className="bg-white rounded-3xl md:rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
                  <ActivityItem date="Oct 24" title="Obedience Level 2" description="Cooper successfully completed the loose-leash walking module." status="Completed" />
                  <ActivityItem date="Oct 22" title="Socialization" description="Luna met 3 new companions today. Improving reactivity." status="Progress" />
                  <ActivityItem date="Oct 20" title="Mastery: Stay" description="Cooper held a 'stay' for 45 seconds under distraction." status="Achievement" isLast />
                </div>
              </motion.section>
            </div>

            <motion.div variants={itemVariants}>
              <section>
                <h2 className="text-xl md:text-2xl font-bold text-[#2D2424] mb-6">Next Sessions</h2>
                <div className="flex flex-col gap-4">
                  <SessionCard pet="Cooper" time="Wed, 3:00 PM" type="In-Person Training" trainer="Alex Rivera" />
                  <SessionCard pet="Luna" time="Fri, 10:30 AM" type="Video Consultation" trainer="Sarah Jenkins" />
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-6 md:py-4 border-2 border-dashed border-[#2D2424]/10 rounded-2xl text-[#2D2424]/40 hover:border-[#8B4513]/40 hover:text-[#8B4513] transition-all flex items-center justify-center gap-2 font-medium bg-white/50"
                  >
                    <Plus size={20} />
                    Book New Session
                  </motion.button>
                </div>
              </section>
            </motion.div>
          </div>
        </motion.main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <MobileNavItem icon={<Home size={22} />} active />
        <MobileNavItem icon={<Calendar size={22} />} />
        <div className="relative -top-6">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            className="bg-[#8B4513] text-white p-4 rounded-full shadow-xl shadow-orange-900/30 active:scale-90 transition-transform"
          >
            <Plus size={24} />
          </motion.button>
        </div>
        <MobileNavItem icon={<Dog size={22} />} />
        <MobileNavItem icon={<Settings size={22} />} onClick={onExit} />
      </nav>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; badge?: string }> = ({ 
  icon, label, active, badge 
}) => (
  <motion.button 
    whileHover={{ x: 5 }}
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

const PetCard: React.FC<{ name: string; breed: string; progress: number; image: string }> = ({ 
  name, breed, progress, image 
}) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="group bg-white p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all active:scale-[0.98] md:active:scale-100 cursor-pointer"
  >
    <div className="flex items-center gap-4 mb-4 md:mb-6">
      <div className="w-14 h-14 md:w-16 md:h-16 organic-shape overflow-hidden bg-gray-100 shadow-inner group-hover:scale-105 transition-transform">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-bold text-[#2D2424]">{name}</h3>
        <p className="text-xs md:text-sm text-[#2D2424]/60">{breed}</p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] md:text-sm font-medium">
        <span className="text-[#2D2424]/60 uppercase tracking-wider">Level Progress</span>
        <span className="text-[#8B4513]">{progress}%</span>
      </div>
      <div className="w-full h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-[#8B4513]" 
        />
      </div>
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
        ${status === 'Completed' ? 'bg-[#8AB17D]/10 text-[#8AB17D]' : 
          status === 'Achievement' ? 'bg-[#E9C46A]/10 text-[#BC6C25]' : 'bg-gray-100 text-gray-400'}`}>
        {status}
      </span>
    </div>
  </div>
);

const SessionCard: React.FC<{ pet: string; time: string; type: string; trainer: string }> = ({ 
  pet, time, type, trainer 
}) => (
  <motion.div 
    whileHover={{ x: 5 }}
    className="bg-[#2D2424] text-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-lg active:scale-[0.98] transition-all cursor-pointer border border-white/5"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[10px] md:text-xs font-bold text-[#FDFBF4]/40 uppercase tracking-widest mb-1">{time}</p>
        <h4 className="text-base md:text-lg font-bold">{pet}'s Lesson</h4>
      </div>
      <ChevronRight className="w-5 h-5 text-[#FDFBF4]/40" />
    </div>
    <div className="space-y-2 md:space-y-3">
      <div className="flex items-center gap-2 text-xs md:text-sm text-[#FDFBF4]/70">
        <Dog size={14} className="text-[#E9C46A]" />
        <span>{type}</span>
      </div>
      <div className="flex items-center gap-2 text-xs md:text-sm text-[#FDFBF4]/70">
        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#8AB17D]"></div>
        <span>{trainer}</span>
      </div>
    </div>
  </motion.div>
);

export default Dashboard;
