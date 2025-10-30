import { useEffect, useState } from 'react';
import { FunnelChart, Funnel, LabelList, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

// Sample data
const sampleData = [
  { name: 'Placed', value: 1000, fill: 'hsl(var(--primary))' },
  { name: 'Shipped', value: 980, fill: 'hsl(var(--accent))' },
  { name: 'Delivered', value: 900, fill: 'hsl(var(--success))' },
  { name: 'RTO', value: 80, fill: 'hsl(var(--destructive))' },
  { name: 'Remitted', value: 820, fill: 'hsl(var(--warning))' }
];

interface OrderFunnelChartProps {
  title?: string;
  description?: string;
  isAnimated?: boolean;
  height?: number;
  className?: string;
  data?: typeof sampleData;
}

export default function OrderFunnelChart({
  title = "Order Funnel",
  description = "Order lifecycle from placement to remittance",
  isAnimated = true,
  height = 300,
  className = "",
  data = sampleData
}: OrderFunnelChartProps) {
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

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip
                formatter={(value: number) => [`${value} orders`, '']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px'
                }}
              />
              <Funnel
                data={chartData}
                dataKey="value"
                isAnimationActive={isAnimated}
                animationDuration={isAnimated ? 1500 : 0}
              >
                <LabelList
                  position={isMobile ? "right" : "center"}
                  fill="#fff"
                  stroke="none"
                  dataKey="name"
                  fontSize={isMobile ? 10 : 12}
                />
                <LabelList
                  position={isMobile ? "left" : "right"}
                  fill="hsl(var(--foreground))"
                  stroke="none"
                  dataKey="value"
                  formatter={(value: number) => `${value}`}
                  fontSize={isMobile ? 10 : 12}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}