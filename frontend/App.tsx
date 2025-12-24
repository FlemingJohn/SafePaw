
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureSection from './components/FeatureSection';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import GovDashboard from './components/GovDashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'citizen' | 'government'>('landing');

  return (
    <div className="min-h-screen selection:bg-orange-200 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Navbar onDashboardClick={() => setView('citizen')} />
            <main>
              <Hero onStartClick={() => setView('citizen')} onGovClick={() => setView('government')} />

              <FeatureSection
                id="report"
                title="Report incidents in 30 seconds"
                description="Quick incident reporting with GPS auto-detection, photo upload, and severity selection. Your reports help create safer communities and enable faster government response."
                image="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=800"
                imageSide="left"
                accentColor="bg-[#E9C46A]"
                buttonText="Report Now"
              />

              <FeatureSection
                id="heatmap"
                title="Live risk heatmap for your safety"
                description="Check risk zones before traveling. Color-coded areas show incident density, helping parents, students, and citizens make informed decisions about their routes."
                image="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                imageSide="right"
                accentColor="bg-[#8AB17D]"
                buttonText="View Heatmap"
              />

              <FeatureSection
                id="emergency"
                title="Emergency rabies help when you need it"
                description="Find nearest hospitals with rabies vaccine availability, get first aid guidance, and access one-tap calling. Every second counts in an emergency."
                image="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"
                imageSide="left"
                accentColor="bg-[#BC6C25]"
                buttonText="Emergency Help"
              />
            </main>
            <Footer />
          </motion.div>
        ) : view === 'citizen' ? (
          <motion.div
            key="citizen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Dashboard onExit={() => setView('landing')} />
          </motion.div>
        ) : (
          <motion.div
            key="government"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <GovDashboard onExit={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
