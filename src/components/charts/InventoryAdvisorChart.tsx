import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatRupee } from '@/lib/mock-data';

// Sample data
const sampleData = [
  { product: "Silver Jhumka Earrings", cost: 2800, profit: 1900, units: 50, ror: 0.68 },
  { product: "Handwoven Silk Saree", cost: 12000, profit: 6600, units: 10, ror: 0.55 },
  { product: "Leather Kolhapuri Chappal", cost: 2500, profit: 1125, units: 40, ror: 0.45 }
];

interface InventoryAdvisorChartProps {
  title?: string;
  description?: string;
  isAnimated?: boolean;
  height?: number;
  className?: string;
  data?: typeof sampleData;
  metric?: 'profit' | 'ror' | 'cost';
}

export default function InventoryAdvisorChart({
  title = "Inventory Advisor",
  description = "AI-powered purchase recommendations",
  isAnimated = true,
  height = 300,
  className = "",
  data = sampleData,
  metric = 'profit'
}: InventoryAdvisorChartProps) {
  const [chartData, setChartData] = useState<typeof data>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isAnimated) {
      // Animate the data loading
      const timer = setTimeout(() => {
        setChartData([...data].sort((a, b) => {
          if (metric === 'ror') {
            return b.ror - a.ror;
          } else if (metric === 'profit') {
            return b.profit - a.profit;
          } else {
            return b.cost - a.cost;
          }
        }));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setChartData([...data].sort((a, b) => {
        if (metric === 'ror') {
          return b.ror - a.ror;
        } else if (metric === 'profit') {
          return b.profit - a.profit;
        } else {
          return b.cost - a.cost;
        }
      }));
    }
  }, [isAnimated, data, metric]);

  // Truncate long product names for mobile
  const formatProductName = (name: string) => {
    if (isMobile && name.length > 15) {
      return `${name.slice(0, 15)}...`;
    }
    return name;
  };

  // Format tooltip values based on metric
  const formatTooltipValue = (value: number) => {
    switch(metric) {
      case 'profit':
      case 'cost':
        return formatRupee(value);
      case 'ror':
        return `${(value * 100).toFixed(0)}%`;
      default:
        return value.toString();
    }
  };

  // Get appropriate label for the metric
  const getMetricLabel = () => {
    switch(metric) {
      case 'profit':
        return 'Projected Profit';
      case 'cost':
        return 'Investment Required';
      case 'ror':
        return 'Rate of Return';
      default:
        return 'Value';
    }
  };

  // Get appropriate color for the metric
  const getBarColor = () => {
    switch(metric) {
      case 'profit':
        return 'hsl(var(--success))';
      case 'cost':
        return 'hsl(var(--primary))';
      case 'ror':
        return 'hsl(var(--accent))';
      default:
        return 'hsl(var(--primary))';
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
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: isMobile ? 80 : 120,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (metric === 'ror') {
                    return `${(value * 100).toFixed(0)}%`;
                  } else {
                    return `₹${(value / 1000)}k`;
                  }
                }}
              />
              <YAxis 
                dataKey="product" 
                type="category" 
                tick={{ fontSize: 12 }}
                tickFormatter={formatProductName}
                width={isMobile ? 80 : 120}
              />
              <Tooltip
                formatter={(value: number) => [formatTooltipValue(value), getMetricLabel()]}
                labelFormatter={(label) => `Product: ${label}`}
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
                name={getMetricLabel()}
                fill={getBarColor()}
                radius={[0, 4, 4, 0]}
                animationDuration={isAnimated ? 1500 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}