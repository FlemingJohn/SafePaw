
import React from 'react';
import { PawPrint, Instagram, Twitter, Facebook, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2D2424] text-[#FDFBF4] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center">
        {/* Simple Branding */}
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-[#8B4513] p-1.5 rounded-lg">
            <PawPrint className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Safe Paw</span>
        </div>

        {/* Minimal Description */}
        <p className="max-w-md text-[#FDFBF4]/50 leading-relaxed font-light text-sm mb-8">
          Dedicated to the resilience and loyalty of Indian street dogs. 
          Empowering rescuers and adopters through specialized care.
        </p>

        {/* Essential Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 text-sm font-medium text-[#FDFBF4]/80">
          <a href="#about" className="hover:text-white transition-colors">Our Mission</a>
          <a href="#care" className="hover:text-white transition-colors">Training</a>
          <a href="#" className="hover:text-white transition-colors">Success Stories</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>

        {/* Minimal Social Icons */}
        <div className="flex gap-6 mb-12 text-[#FDFBF4]/40">
          <motion.a whileHover={{ y: -2, color: '#FDFBF4' }} href="#" className="transition-colors"><Instagram size={20} /></motion.a>
          <motion.a whileHover={{ y: -2, color: '#FDFBF4' }} href="#" className="transition-colors"><Twitter size={20} /></motion.a>
          <motion.a whileHover={{ y: -2, color: '#FDFBF4' }} href="#" className="transition-colors"><Facebook size={20} /></motion.a>
        </div>

        {/* Bottom Bar */}
        <div className="w-full pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] uppercase tracking-widest text-[#FDFBF4]/30">
          <p>© 2024 Safe Paw India</p>
          <div className="flex items-center gap-1">
            Made with <Heart size={10} className="text-[#8B4513] fill-current" /> for Desi Indies
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#FDFBF4] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#FDFBF4] transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
