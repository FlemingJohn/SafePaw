
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureSection from './components/FeatureSection';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import GovDashboard from './components/GovDashboard';
import AuthPage from './components/AuthPage';
import { onAuthChange, getUserProfile, UserRole } from './services/authService';

type View = 'landing' | 'auth' | 'citizen' | 'government';

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication state on mount
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        // User is logged in, get their role
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserRole(profile.role);
          setIsAuthenticated(true);
          // Redirect to appropriate dashboard
          if (profile.role === 'citizen') {
            setView('citizen');
          } else if (profile.role === 'government') {
            setView('government');
          }
        }
      } else {
        // User is logged out
        setIsAuthenticated(false);
        setUserRole(null);
        setView('landing');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'citizen') {
      setView('citizen');
    } else if (role === 'government') {
      setView('government');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setView('landing');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2D2424] font-semibold">Loading SafePaw...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-orange-200 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Navbar
              onCitizenClick={() => setView('auth')}
              onGovClick={() => setView('auth')}
            />
            <main>
              <Hero
                onStartClick={() => setView('auth')}
                onGovClick={() => setView('auth')}
              />

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
        )}

        {view === 'auth' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AuthPage onSuccess={handleAuthSuccess} />
          </motion.div>
        )}

        {view === 'citizen' && (
          <motion.div
            key="citizen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Dashboard onExit={handleLogout} />
          </motion.div>
        )}

        {view === 'government' && (
          <motion.div
            key="government"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <GovDashboard onExit={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
