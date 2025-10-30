import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatRupee } from '@/lib/mock-data';

// Sample data
const sampleData = [
  { courier: "FastDelivery", orders: 450, revenue: 225000, rto: 14, remittanceDelay: 8 },
  { courier: "SpeedPost", orders: 320, revenue: 160000, rto: 10, remittanceDelay: 12 },
  { courier: "DeliverNow", orders: 230, revenue: 115000, rto: 15, remittanceDelay: 7 }
];

interface ChannelComparisonChartProps {
  title?: string;
  description?: string;
  isAnimated?: boolean;
  height?: number;
  className?: string;
  data?: typeof sampleData;
  metric?: 'orders' | 'revenue' | 'rto' | 'remittanceDelay';
}

export default function ChannelComparisonChart({
  title = "Channel Comparison",
  description = "Performance metrics by courier partner",
  isAnimated = true,
  height = 300,
  className = "",
  data = sampleData,
  metric = 'orders'
}: ChannelComparisonChartProps) {
  const [chartData, setChartData] = useState<typeof data>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isAnimated) {
      // Animate the data loading
      const timer = setTimeout(() => {
        setChartData(data);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setChartData(data);
    }
  }, [isAnimated, data]);

  // Set color based on metric type
  const getBarColor = () => {
    switch(metric) {
      case 'orders':
        return 'hsl(var(--primary))';
      case 'revenue':
        return 'hsl(var(--accent))';
      case 'rto':
        return 'hsl(var(--destructive))';
      case 'remittanceDelay':
        return 'hsl(var(--warning))';
      default:
        return 'hsl(var(--primary))';
    }
  };

  // Format tooltip values based on metric
  const formatTooltipValue = (value: number) => {
    switch(metric) {
      case 'revenue':
        return formatRupee(value);
      case 'rto':
        return `${value}%`;
      case 'remittanceDelay':
        return `${value} days`;
      default:
        return value.toString();
    }
  };

  // Format Y-axis values
  const formatYAxis = (value: number) => {
    switch(metric) {
      case 'revenue':
        return `₹${(value / 1000)}k`;
      case 'rto':
        return `${value}%`;
      case 'remittanceDelay':
        return `${value}d`;
      default:
        return value.toString();
    }
  };

  // Get appropriate label for the metric
  const getMetricLabel = () => {
    switch(metric) {
      case 'orders':
        return 'Orders';
      case 'revenue':
        return 'Revenue';
      case 'rto':
        return 'RTO Rate (%)';
      case 'remittanceDelay':
        return 'Remittance Delay (days)';
      default:
        return 'Value';
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: isMobile ? 0 : 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="courier" 
                tick={{ fontSize: 12 }} 
                tickMargin={10} 
              />
              <YAxis 
                tickFormatter={formatYAxis}
                width={isMobile ? 40 : 60}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [formatTooltipValue(value), getMetricLabel()]}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px'
                }}
              />
              <Legend formatter={() => getMetricLabel()} />
              <Bar 
                dataKey={metric} 
                fill={getBarColor()} 
                radius={[4, 4, 0, 0]}
                animationDuration={isAnimated ? 1500 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}