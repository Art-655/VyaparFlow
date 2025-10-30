import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Warehouse, Bot, LayoutDashboard } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Predictive Cash Flow',
      description: 'Know your future bank balance with AI-powered forecasts of COD remittances.'
    },
    {
      icon: Warehouse,
      title: 'Intelligent Inventory Advisor',
      description: 'Get a dynamic, optimal restocking plan powered by advanced algorithms.'
    },
    {
      icon: Bot,
      title: 'Scenario Planner',
      description: 'Safely test marketing and discount strategies without risking your cash flow.'
    },
    {
      icon: LayoutDashboard,
      title: 'Unified Dashboard',
      description: 'All your data—sales, shipments, cash—in one simple, unified view.'
    }
  ];

  return (
    <section className="vyapar-section bg-background" id="features">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="vyapar-heading">Everything You Need to Stay Liquid and Profitable</h2>
          <p className="vyapar-subheading">Powerful tools designed specifically for Indian D2C brands</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="vyapar-card h-full">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}