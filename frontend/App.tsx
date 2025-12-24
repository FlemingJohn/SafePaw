
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureSection from './components/FeatureSection';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

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
            <Navbar onDashboardClick={() => setView('dashboard')} />
            <main>
              <Hero onStartClick={() => setView('dashboard')} />
              
              <FeatureSection 
                id="about"
                title="Training that brings out the best in them"
                description="Every dog is unique, and so is our approach. We focus on positive reinforcement and clear communication to build a bond that lasts a lifetime."
                image="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800"
                imageSide="left"
                accentColor="bg-[#E9C46A]"
                buttonText="Expert Programs"
              />

              <FeatureSection 
                id="care"
                title="Premium care and structured routines"
                description="From puppy socialization to advanced obedience, our structured programs ensure your pet receives the right mental and physical stimulation every day."
                image="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800"
                imageSide="right"
                accentColor="bg-[#8AB17D]"
                buttonText="Our Process"
              />

              <FeatureSection 
                id="pricing"
                title="Join the pack with a custom plan"
                description="We offer flexible scheduling and personalized training tracks. Whether you need in-home sessions or group workshops, we have a plan for you."
                image="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800"
                imageSide="left"
                accentColor="bg-[#BC6C25]"
                buttonText="View Plans"
                price="$250/mo Starting"
              />
            </main>
            <Footer />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Dashboard onExit={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
