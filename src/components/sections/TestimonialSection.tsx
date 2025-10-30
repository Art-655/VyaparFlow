import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

export default function TestimonialSection() {
  return (
    <section className="vyapar-section bg-card relative overflow-hidden" id="testimonial">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="vyapar-heading">Trusted by Pioneering D2C Brands</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Card className="border border-border/50 shadow-lg">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-1 flex justify-center">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-md opacity-70"></div>
                    <img 
                      src="https://storage.googleapis.com/fenado-ai-farm-public/generated/f5c43335-2523-4b7f-8cf0-42ddf92f0558.webp" 
                      alt="Priya Sharma" 
                      className="relative w-32 h-32 object-cover rounded-full border-2 border-border"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <Quote className="h-8 w-8 text-primary/50 mb-4" />
                  <blockquote className="text-xl md:text-2xl font-medium italic mb-6">
                    "VyaparFlow took the constant stress out of my business. I used to worry daily about cash for restocking. Now, the AI tells me what to buy and when, and I've grown my monthly revenue by 30% confidently."
                  </blockquote>
                  <div>
                    <p className="font-semibold text-foreground">Priya Sharma</p>
                    <p className="text-muted-foreground">Founder of Pune-based 'SilverKnot Jewellery'</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}