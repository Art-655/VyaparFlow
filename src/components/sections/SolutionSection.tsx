import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { PlugZap, BrainCircuit, BarChartBig, GitFork } from 'lucide-react';

export default function SolutionSection() {
  const steps = [
    {
      icon: PlugZap,
      title: 'Connect',
      description: 'Securely link your Shopify, Shiprocket, and WhatsApp sales data in 5 minutes.'
    },
    {
      icon: BrainCircuit,
      title: 'Predict',
      description: 'Our AI engine forecasts exactly when your COD payments will be credited.'
    },
    {
      icon: BarChartBig,
      title: 'Optimize',
      description: 'Get a smart, AI-powered purchasing plan to maximize profit with your available cash.'
    },
    {
      icon: GitFork,
      title: 'Decide',
      description: "Model 'what-if' scenarios for discounts and marketing spend without risking your stability."
    }
  ];

  return (
    <section className="vyapar-section bg-background relative overflow-hidden" id="solution">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="vyapar-heading">From Data Chaos to Financial Clarity</h2>
          <p className="vyapar-subheading">Our simple 4-step process transforms your business finances</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <Card className="vyapar-card h-full">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  {/* Step number badge */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  
                  {/* Connector line (except for the last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden xl:block absolute top-1/2 -right-4 w-8 h-px border-t-2 border-dashed border-primary/40"></div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}