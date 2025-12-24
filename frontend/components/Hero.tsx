
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onStartClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <section className="relative pt-24 pb-12 md:pt-48 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12">

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 z-10 text-center md:text-left"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] text-[#2D2424] mb-6 md:mb-8"
          >
            Real-time dog bite incident tracking and prevention
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-[#2D2424]/70 max-w-lg mx-auto md:mx-0 mb-8 md:mb-10 leading-relaxed font-light"
          >
            Report incidents, check risk zones, find emergency help, and track government action. Together, we create safer communities for everyone.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex justify-center md:justify-start"
          >
            <button
              onClick={onStartClick}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-[#8B4513] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#6D3610] transition-all shadow-xl shadow-orange-900/20 active:scale-95"
            >
              Report Incident
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full md:w-1/2 relative mt-12 md:mt-0"
        >
          <div className="relative z-10 w-full aspect-[4/5] sm:aspect-square md:aspect-[4/3] flex items-center justify-center">
            {/* Organic Shape Background */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
                borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 30% 70% 40% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"]
              }}
              transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#98A57F] opacity-30 organic-shape"
            />

            <motion.img
              whileHover={{ scale: 1.02, rotate: 1 }}
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=1200"
              alt="Dog bite prevention and safety"
              className="relative z-20 w-full h-full object-cover rounded-[2.5rem] md:rounded-[4rem] shadow-2xl cursor-pointer"
            />
          </div>

          {/* Floating Element */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-6 md:-left-12 z-30 bg-white p-3 sm:p-4 md:p-6 rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 border border-gray-100"
          >
            <div className="bg-green-100 p-1.5 sm:p-2 rounded-full">
              <span className="text-lg md:text-xl">🐾</span>
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Safe Communities</p>
              <p className="text-sm md:text-lg font-bold text-[#2D2424]">5k+ Reports</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Blur */}
      <motion.div
        animate={{ opacity: [0.1, 0.15, 0.1], scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-5%] w-[60%] h-[40%] bg-[#E9C46A] blur-[100px] md:blur-[150px] opacity-10 rounded-full"
      />
    </section>
  );
};

export default Hero;
