
import React, { useState, useEffect } from 'react';
import { Menu, X, PawPrint, LayoutDashboard, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onDashboardClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onDashboardClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Report Incident', href: '#report' },
    { name: 'Risk Heatmap', href: '#heatmap' },
    { name: 'Emergency Help', href: '#emergency' },
    { name: 'About', href: '#about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-12 py-4 md:py-6 pointer-events-none">
      <motion.div 
        initial={false}
        animate={{
          backgroundColor: scrolled ? 'rgba(45, 36, 36, 0.95)' : 'rgba(253, 251, 244, 0)',
          backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
          padding: scrolled ? '12px 24px' : '16px 0px',
          borderRadius: scrolled ? '999px' : '0px',
          boxShadow: scrolled ? '0 20px 40px rgba(0,0,0,0.1)' : '0 0px 0px rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`max-w-7xl mx-auto flex justify-between items-center pointer-events-auto w-full`}
      >
        {/* Logo Section */}
        <motion.div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className={`${scrolled ? 'bg-[#8B4513]' : 'bg-[#2D2424]'} p-2 rounded-xl transition-colors duration-300 shadow-sm group-hover:shadow-md`}>
            <PawPrint className="text-white w-5 h-5" />
          </div>
          <span className={`text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-[#FDFBF4]' : 'text-[#2D2424]'}`}>
            Safe Paw
          </span>
        </motion.div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link, idx) => (
            <motion.a 
              key={link.name} 
              href={link.href} 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className={`text-sm font-semibold transition-all relative group ${scrolled ? 'text-[#FDFBF4]/80 hover:text-white' : 'text-[#2D2424]/70 hover:text-[#2D2424]'}`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${scrolled ? 'bg-[#E9C46A]' : 'bg-[#8B4513]'}`}></span>
            </motion.a>
          ))}
        </div>

        {/* Right Action Side */}
        <div className="hidden md:flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDashboardClick}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${scrolled ? 'text-[#E9C46A] hover:text-[#FDFBF4]' : 'text-[#8B4513] hover:text-[#2D2424]'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Citizen Portal
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`px-7 py-3 rounded-full font-bold text-sm shadow-xl transition-all flex items-center gap-2
              ${scrolled 
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20' 
                : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/30'}`}
          >
            <Heart className="w-4 h-4 fill-current" />
            Report Incident
          </motion.button>
        </div>

        {/* Mobile Toggle Button */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className={`md:hidden p-2 rounded-full transition-colors ${scrolled ? 'text-white' : 'text-[#2D2424]'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </motion.div>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#2D2424] z-[60] flex flex-col p-8 md:hidden pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-3">
                <div className="bg-[#8B4513] p-2 rounded-xl">
                  <PawPrint className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Safe Paw</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link, idx) => (
                <motion.a 
                  key={link.name} 
                  href={link.href} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="text-4xl font-bold text-[#FDFBF4]/90 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.button 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => { onDashboardClick(); setIsOpen(false); }}
                className="flex items-center gap-4 text-2xl font-bold text-[#E9C46A] pt-4 border-t border-white/10"
              >
                <LayoutDashboard className="w-8 h-8" />
                Citizen Portal
              </motion.button>
            </div>
            
            <div className="mt-auto pb-12">
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full bg-red-600 text-white px-6 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-red-900/20"
              >
                Report Dog Bite
              </motion.button>
              <div className="mt-8 flex justify-center gap-6 text-[#FDFBF4]/40">
                <Heart className="w-6 h-6" />
                <ShoppingBag className="w-6 h-6" />
                <PawPrint className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
