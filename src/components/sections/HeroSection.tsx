import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import VideoDialog from '@/components/dialogs/VideoDialog';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden" id="hero">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 opacity-90"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          opacity: 0.3
        }}></div>
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-32 left-10 w-20 h-20 border border-primary/30 rounded-lg"
        animate={{
          rotate: [0, 180],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-20 w-16 h-16 bg-primary/10 rounded-full"
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -15, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-32 w-24 h-24 border border-secondary/20 rounded-full"
        animate={{
          scale: [1, 1.15, 1],
          x: [0, 20, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="vyapar-heading">
              Master Your Cash Flow. <span className="text-gradient">Unleash Your D2C Brand's Potential.</span>
            </h1>
            <p className="text-xl text-foreground/80 mb-8 max-w-xl">
              VyaparFlow uses AI to predict your incoming COD payments and intelligently advises you on what to buy next. Go from surviving to thriving.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="vyapar-button-primary text-lg px-8 py-6"
                onClick={onGetStarted}
              >
                Start Your Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="vyapar-button-secondary text-lg px-8 py-6"
                onClick={() => setVideoDialogOpen(true)}
              >
                Watch Demo Video (2 mins)
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Glowing effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl blur-xl opacity-50"></div>
              
              {/* Dashboard image */}
              <img 
                src="https://storage.googleapis.com/fenado-ai-farm-public/generated/127745b0-c3d0-4265-8b65-c99ed233585b.webp" 
                alt="VyaparFlow Dashboard" 
                className="relative rounded-xl shadow-2xl border border-border/50 w-full"
              />
              
              {/* Floating badge */}
              <motion.div 
                className="absolute -right-6 -bottom-6 bg-card border border-border shadow-lg rounded-lg px-4 py-3 flex items-center gap-2"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="h-3 w-3 bg-primary rounded-full"></span>
                <span className="font-semibold text-sm whitespace-nowrap">AI Powered Predictions</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Dialog */}
      <VideoDialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen} />
    </section>
  );
}