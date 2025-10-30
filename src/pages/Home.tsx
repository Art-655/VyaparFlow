import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import ProblemSection from '@/components/sections/ProblemSection';
import SolutionSection from '@/components/sections/SolutionSection';
import DemoSection from '@/components/sections/DemoSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import TestimonialSection from '@/components/sections/TestimonialSection';
import CtaSection from '@/components/sections/CtaSection';
import SignUpDialog from '@/components/dialogs/SignUpDialog';
import LoginDialog from '@/components/dialogs/LoginDialog';

export default function Home() {
  const [signUpDialogOpen, setSignUpDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  // Handle dialog state from URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#signup') {
        setSignUpDialogOpen(true);
        setLoginDialogOpen(false);
      } else if (hash === '#login') {
        setLoginDialogOpen(true);
        setSignUpDialogOpen(false);
      }
    };
    
    // Check hash on initial load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleGetStarted = () => {
    setSignUpDialogOpen(true);
    setLoginDialogOpen(false);
  };

  const switchToLogin = () => {
    setLoginDialogOpen(true);
    setSignUpDialogOpen(false);
  };

  const switchToSignUp = () => {
    setSignUpDialogOpen(true);
    setLoginDialogOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <HeroSection onGetStarted={handleGetStarted} />
        <ProblemSection />
        <SolutionSection />
        <DemoSection />
        <FeaturesSection />
        <TestimonialSection />
        <CtaSection onGetStarted={handleGetStarted} />
      </main>
      
      <Footer />

      {/* Dialogs */}
      <SignUpDialog 
        open={signUpDialogOpen} 
        onOpenChange={setSignUpDialogOpen} 
        onSwitchToLogin={switchToLogin} 
      />
      
      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen} 
        onSwitchToSignUp={switchToSignUp} 
      />
    </div>
  );
}