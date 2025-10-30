import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Hourglass, ClipboardCheck, TrendingDown } from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      icon: Hourglass,
      title: 'Unpredictable Income',
      description: 'You made sales, but when will the COD money actually hit your bank?'
    },
    {
      icon: ClipboardCheck,
      title: 'Inventory Guesswork',
      description: "Should you restock your bestseller? You're guessing because you don't know your exact cash position."
    },
    {
      icon: TrendingDown,
      title: 'Missed Opportunities',
      description: "You hesitate to run ads or launch new products because you're afraid of running out of cash."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="vyapar-section bg-card" id="problem">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="vyapar-heading">Is Your Cash Stuck in Transit?</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6"
          >
            {problems.map((problem, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="vyapar-card overflow-hidden">
                  <CardContent className="p-6 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <problem.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                      <p className="text-muted-foreground">{problem.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-lg opacity-30"></div>
              <img 
                src="https://storage.googleapis.com/fenado-ai-farm-public/generated/f3c13d6f-0ea2-48a2-a52e-87e6a61ca72c.webp" 
                alt="Cash Flow Problem Flowchart" 
                className="relative rounded-xl border border-border/50 w-full max-w-md mx-auto shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}