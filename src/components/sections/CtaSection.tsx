import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CtaSectionProps {
  onGetStarted: () => void;
}

export default function CtaSection({ onGetStarted }: CtaSectionProps) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-accent text-accent-foreground relative overflow-hidden" id="cta">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          opacity: 0.2
        }}></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 text-accent-foreground">
            Ready to Transform Your Business Finances?
          </h2>
          <p className="text-xl text-accent-foreground/80 mb-10">
            Join hundreds of smart D2C founders who are making data-driven decisions.
          </p>
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Get Started - Free 14-Day Trial
          </Button>
        </motion.div>
      </div>
    </section>
  );
}