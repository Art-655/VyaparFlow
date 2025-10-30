import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

// Sample data
const sampleData = [
  {
    week: 'Week 1',
    predictedCashIn: 50000,
    actualCashIn: 52000
  },
  {
    week: 'Week 2',
    predictedCashIn: 78000,
    actualCashIn: 75000
  },
  {
    week: 'Week 3',
    predictedCashIn: 65000,
    actualCashIn: 68000
  },
  {
    week: 'Week 4',
    predictedCashIn: 92000,
    actualCashIn: null
  }
];

// Format INR currency
const formatRupee = (value: number) => {
  return `₹${value.toLocaleString('en-IN')}`;
};

interface CashFlowChartProps {
  title?: string;
  description?: string;
  isAnimated?: boolean;
  height?: number;
  className?: string;
  data?: any;
}

export default function CashFlowChart({ 
  title = "Cash Flow Forecast", 
  description = "Predicted vs. Actual Cash In for the next 4 weeks",
  isAnimated = true,
  height = 300,
  className = ""
  , data: incomingData
}: CashFlowChartProps) {
  const [data, setData] = useState<typeof sampleData>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    // If caller passed data, use it (prefer live data). Otherwise use sampleData with optional animation.
    if (incomingData && Array.isArray(incomingData) && incomingData.length > 0) {
      setData(incomingData);
      return;
    }

    if (isAnimated) {
      // Animate the data loading
      const timer = setTimeout(() => {
        setData(sampleData);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setData(sampleData);
    }
  }, [isAnimated, incomingData]);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: isMobile ? 0 : 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }} 
                tickMargin={10} 
              />
              <YAxis 
                tickFormatter={(value) => `₹${(value / 1000)}k`}
                width={isMobile ? 40 : 60}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [formatRupee(value), '']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px'
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="predictedCashIn"
                name="Predicted Cash In"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                animationDuration={isAnimated ? 1500 : 0}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="actualCashIn"
                name="Actual Cash In"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ r: 4 }}
                animationDuration={isAnimated ? 2000 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}