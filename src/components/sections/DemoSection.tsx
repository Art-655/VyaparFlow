import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import CashFlowChart from '@/components/charts/CashFlowChart';
import InventoryChart from '@/components/charts/InventoryChart';

export default function DemoSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleLoadData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsDataLoaded(true);
    }, 2000);
  };

  return (
    <section className="vyapar-section bg-card relative" id="demo">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="vyapar-heading">See the Power of Prediction</h2>
          <p className="vyapar-subheading">
            Connect a sample dataset to see VyaparFlow in action. (This is a demo with sample data).
          </p>
        </motion.div>

        <div className="flex flex-col items-center">
          {!isDataLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                onClick={handleLoadData}
                disabled={isLoading}
                size="lg"
                className="vyapar-button-primary text-lg px-8 py-6 mb-10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading Sample Dataset...
                  </>
                ) : (
                  'Load Sample Dataset'
                )}
              </Button>
            </motion.div>
          )}

          <AnimatePresence>
            {isDataLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <CashFlowChart isAnimated={true} height={350} />
                <InventoryChart isAnimated={true} height={350} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}